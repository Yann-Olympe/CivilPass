<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\Transfert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $agent = $request->user();
        $query = Demande::with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert']);

        if ($agent->role === 'origine') {
            $query->where('mairie_origine_id', $agent->mairie_id);
        } elseif ($agent->role === 'retrait') {
            $query->where('mairie_retrait_id', $agent->mairie_id)
                ->whereIn('statut', ['en_cours', 'validee', 'remise']);
        } else {
            $query->where(function ($q) use ($agent) {
                $q->where('mairie_origine_id', $agent->mairie_id)
                  ->orWhere('mairie_retrait_id', $agent->mairie_id);
            });
        }

        return response()->json($query->latest('date_creation')->get());
    }

    public function show(Request $request, Demande $demande)
    {
        $this->autoriserAcces($request, $demande);

        return response()->json(
            $demande->load(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
        );
    }

    public function valider(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutValiderOrigine() && $demande->mairie_origine_id === $agent->mairie_id, 403,
            "Seul un agent de la Mairie d'origine peut valider cette demande.");

        abort_unless(in_array($demande->statut, ['nouvelle', 'urgente']), 409,
            "Cette demande n'est plus en attente de validation.");

        $data = $request->validate([
            'souche_retrouvee' => 'required|boolean',
            'observation_origine' => 'nullable|string|max:1000',
            'motif' => 'nullable|string|max:200',
        ]);

        return DB::transaction(function () use ($data, $demande) {
            if (! $data['souche_retrouvee']) {
                $demande->update([
                    'statut' => 'rejetee',
                    'souche_retrouvee' => false,
                    'observation_origine' => $data['observation_origine'] ?? null,
                    'motif_statut' => $data['motif'] ?? 'La souche n’a pas été retrouvée par la mairie d’origine.',
                ]);

                $this->notifierUsager($demande, 'rejetee', $demande->motif_statut);

                return response()->json($demande->fresh(), 422);
            }

            $demande->update([
                'statut' => 'en_cours',
                'souche_retrouvee' => true,
                'observation_origine' => $data['observation_origine'] ?? null,
                'motif_statut' => $data['motif'] ?? 'La demande a été validée par la mairie d’origine et est en cours de traitement.',
            ]);

            $this->notifierUsager($demande, 'en_cours', $demande->motif_statut);

            $transfert = Transfert::updateOrCreate(
                ['demande_id' => $demande->id],
                ['statut' => 'valide', 'date_validation_origine' => now()]
            );

            Notification::create([
                'mairie_id' => $demande->mairie_retrait_id,
                'demande_id' => $demande->id,
                'type' => 'dossier_transfere',
                'message' => "Nouveau dossier transféré par {$demande->mairieOrigine->nom} — n°{$demande->id}",
            ]);

            return response()->json([
                'demande' => $demande->fresh(),
                'transfert' => $transfert,
            ]);
        });
    }

    public function recevoir(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutReceptionnerRetrait() && $demande->mairie_retrait_id === $agent->mairie_id, 403,
            "Seul un agent de la Mairie de retrait peut réceptionner ce dossier.");

        abort_unless($demande->statut === 'en_cours', 409,
            "Ce dossier n'a pas encore été transféré par la Mairie d'origine.");

        return DB::transaction(function () use ($demande) {
            $demande->update([
                'statut' => 'validee',
                'motif_statut' => 'La demande a été réceptionnée et validée par la mairie de retrait.',
            ]);
            $this->notifierUsager($demande, 'validee', $demande->motif_statut);

            $demande->transfert()->update([
                'statut' => 'recu',
                'date_reception_retrait' => now(),
            ]);

            Notification::create([
                'mairie_id' => $demande->mairie_origine_id,
                'demande_id' => $demande->id,
                'type' => 'dossier_recu',
                'message' => "Le dossier n°{$demande->id} a été reçu par {$demande->mairieRetrait->nom}",
            ]);

            return response()->json($demande->fresh()->load('transfert'));
        });
    }

    public function remettre(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutReceptionnerRetrait() && $demande->mairie_retrait_id === $agent->mairie_id, 403);
        abort_unless($demande->statut === 'validee', 409, "Le dossier n'est pas encore validé.");

        return DB::transaction(function () use ($demande) {
            $demande->update([
                'statut' => 'remise',
                'date_remise' => now(),
                'motif_statut' => 'Le document a été remis au citoyen au guichet de la mairie de retrait.',
            ]);

            $this->notifierUsager($demande, 'remise', $demande->motif_statut);

            return response()->json($demande->fresh());
        });
    }

    public function urgente(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutValiderOrigine() && $demande->mairie_origine_id === $agent->mairie_id, 403);
        abort_unless(in_array($demande->statut, ['nouvelle', 'en_cours']), 409,
            "Cette demande ne peut plus être marquée urgente.");

        $data = $request->validate(['motif' => 'required|string|max:200']);
        $demande->update(['statut' => 'urgente', 'motif_statut' => $data['motif']]);
        $this->notifierUsager($demande, 'urgente', $data['motif']);

        return response()->json($demande->fresh());
    }

    public function scan(Request $request)
    {
        $data = $request->validate(['qr_token' => 'required|string']);

        $demande = Demande::where('qr_token', $data['qr_token'])
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait'])
            ->firstOrFail();

        $this->autoriserAcces($request, $demande);

        return response()->json($demande);
    }

    private function autoriserAcces(Request $request, Demande $demande): void
    {
        $agent = $request->user();
        $concerne = $demande->mairie_origine_id === $agent->mairie_id
            || $demande->mairie_retrait_id === $agent->mairie_id;

        abort_unless($concerne, 403, "Ce dossier ne concerne pas votre Mairie.");
    }

    private function notifierUsager(Demande $demande, string $statut, string $motif): void
    {
        Notification::create([
            'mairie_id' => $demande->mairie_origine_id,
            'usager_id' => $demande->usager_id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
            'message' => "Votre demande n°{$demande->id} est {$statut}. Motif : {$motif}",
        ]);
    }
}
