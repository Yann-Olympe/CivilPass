<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\Transfert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $agent = $this->agentAuthentifie($request);
        $query = Demande::with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert']);

        $query->where(function ($q) use ($agent) {
            $q->where('mairie_origine_id', $agent->mairie_id)
              ->orWhere('mairie_retrait_id', $agent->mairie_id);
        });

        return response()->json($query->latest('date_creation')->get());
    }

    public function show(Request $request, Demande $demande)
    {
        $this->autoriserAcces($request, $demande);

        return response()->json(
            $demande->load(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
        );
    }

    public function showTransfert(Request $request, Transfert $transfert)
    {
        $demande = $transfert->demande()
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
            ->firstOrFail();

        $this->autoriserAcces($request, $demande);

        return response()->json($demande);
    }

    public function valider(Request $request, Demande $demande)
    {
        $agent = $this->agentAuthentifie($request);
        $data = $request->validate([
            'souche_retrouvee' => 'required|boolean',
            'observation_origine' => 'nullable|string|max:1000',
            'motif' => 'nullable|string|max:200',
        ]);

        return DB::transaction(function () use ($data, $demande, $agent) {
            $demande = Demande::query()->lockForUpdate()->findOrFail($demande->id);
            $this->autoriserActionOrigine($agent, $demande);
            abort_unless(in_array($demande->statut, ['nouvelle', 'urgente'], true), 409,
                "Cette demande n'est plus en attente de validation.");

            if (! $data['souche_retrouvee']) {
                $demande->update([
                    'statut' => 'rejetee',
                    'souche_retrouvee' => false,
                    'observation_origine' => $data['observation_origine'] ?? null,
                    'motif_statut' => $data['motif'] ?? 'La souche n’a pas été retrouvée par la mairie d’origine.',
                ]);

                $this->notifierUsager($demande, 'rejetee', $demande->motif_statut);

                return response()->json($demande->fresh()->load([
                    'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
                ]));
            }

            abort_unless(! $demande->transfert()->exists(), 409,
                'Un transfert existe déjà pour cette demande.');

            $dateValidation = now();
            $demande->update([
                'statut' => 'en_cours',
                'souche_retrouvee' => true,
                'observation_origine' => $data['observation_origine'] ?? null,
                'motif_statut' => $data['motif'] ?? 'La demande a été validée par la mairie d’origine et est en cours de traitement.',
            ]);

            $transfert = Transfert::create([
                'demande_id' => $demande->id,
                'statut' => 'valide',
                'date_validation_origine' => $dateValidation,
                'valide_par_agent_id' => $agent->id,
            ]);

            $this->notifierUsager($demande, 'en_cours', $demande->motif_statut);
            Notification::create([
                'mairie_id' => $demande->mairie_retrait_id,
                'demande_id' => $demande->id,
                'type' => 'dossier_transfere',
                'message' => "Nouveau dossier transféré par {$demande->mairieOrigine->nom} — n°{$demande->id}",
            ]);

            return response()->json($demande->fresh()->load([
                'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
            ]));
        }, 3);
    }

    public function demanderCorrection(Request $request, Demande $demande)
    {
        $agent = $this->agentAuthentifie($request);
        $this->autoriserActionOrigine($agent, $demande);

        $data = $request->validate([
            'motif' => 'required|string|min:3|max:1000',
        ]);

        return DB::transaction(function () use ($data, $demande, $agent) {
            $demande = Demande::query()->lockForUpdate()->findOrFail($demande->id);
            $this->autoriserActionOrigine($agent, $demande);

            abort_unless(in_array($demande->statut, ['nouvelle', 'urgente']), 409,
                "Cette demande ne peut plus faire l'objet d'une correction.");

            $demande->update([
                'statut' => 'correction_demandee',
                'souche_retrouvee' => null,
                'observation_origine' => null,
                'motif_statut' => trim($data['motif']),
            ]);

            $this->notifierUsager($demande, 'en attente de correction', $demande->motif_statut);

            return response()->json($demande->fresh()->load([
                'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
            ]));
        });
    }

    public function recevoir(Request $request, Demande $demande)
    {
        $agent = $this->agentAuthentifie($request);

        return DB::transaction(function () use ($demande, $agent) {
            $demande = Demande::query()->lockForUpdate()->findOrFail($demande->id);
            $this->autoriserActionRetrait($agent, $demande);
            $transfert = $demande->transfert()->lockForUpdate()->first();

            abort_unless(
                in_array($demande->statut, ['en_cours', 'urgente'], true)
                && $transfert?->statut === 'valide',
                409,
                "Ce dossier n'a pas encore été transféré par la Mairie d'origine."
            );

            $demande->update([
                'statut' => 'validee',
                'motif_statut' => 'La demande a été réceptionnée et validée par la mairie de retrait.',
            ]);
            $transfert->update([
                'statut' => 'recu',
                'date_reception_retrait' => now(),
                'recu_par_agent_id' => $agent->id,
            ]);

            $this->notifierUsager($demande, 'validee', $demande->motif_statut);
            Notification::create([
                'mairie_id' => $demande->mairie_origine_id,
                'demande_id' => $demande->id,
                'type' => 'dossier_recu',
                'message' => "Le dossier n°{$demande->id} a été reçu par {$demande->mairieRetrait->nom}",
            ]);

            return response()->json($demande->fresh()->load([
                'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
            ]));
        }, 3);
    }

    public function remettre(Request $request, Demande $demande)
    {
        $agent = $this->agentAuthentifie($request);

        return DB::transaction(function () use ($demande, $agent) {
            $demande = Demande::query()->lockForUpdate()->findOrFail($demande->id);
            $this->autoriserActionRetrait($agent, $demande);
            $transfert = $demande->transfert()->lockForUpdate()->first();

            abort_unless(
                $demande->statut === 'validee' && $transfert?->statut === 'recu',
                409,
                "Le dossier doit être réceptionné avant sa remise au citoyen."
            );

            $demande->update([
                'statut' => 'remise',
                'date_remise' => now(),
                'remis_par_agent_id' => $agent->id,
                'motif_statut' => 'Le document a été remis au citoyen au guichet de la mairie de retrait.',
            ]);

            $this->notifierUsager($demande, 'remise', $demande->motif_statut);

            return response()->json($demande->fresh()->load([
                'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
            ]));
        }, 3);
    }

    public function urgente(Request $request, Demande $demande)
    {
        $agent = $this->agentAuthentifie($request);

        $data = $request->validate(['motif' => 'required|string|max:200']);

        return DB::transaction(function () use ($demande, $agent, $data) {
            $demande = Demande::query()->lockForUpdate()->findOrFail($demande->id);
            $this->autoriserActionOrigine($agent, $demande);
            abort_unless(in_array($demande->statut, ['nouvelle', 'en_cours'], true), 409,
                "Cette demande ne peut plus être marquée urgente.");

            $demande->update(['statut' => 'urgente', 'motif_statut' => $data['motif']]);
            $this->notifierUsager($demande, 'urgente', $data['motif']);

            return response()->json($demande->fresh()->load([
                'usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert',
            ]));
        }, 3);
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
        $agent = $this->agentAuthentifie($request);
        $concerne = (int) $demande->mairie_origine_id === (int) $agent->mairie_id
            || (int) $demande->mairie_retrait_id === (int) $agent->mairie_id;

        abort_unless($concerne, 403, "Ce dossier ne concerne pas votre Mairie.");
    }

    private function agentAuthentifie(Request $request): Agent
    {
        $agent = $request->user();
        abort_unless($agent instanceof Agent, 403, 'Un compte agent de mairie est requis.');

        return $agent;
    }

    private function autoriserActionOrigine(Agent $agent, Demande $demande): void
    {
        abort_unless(
            (int) $demande->mairie_origine_id === (int) $agent->mairie_id
                && $agent->peutValiderOrigine(),
            403,
            "Seul un agent habilité de la Mairie d'origine peut effectuer cette action."
        );
    }

    private function autoriserActionRetrait(Agent $agent, Demande $demande): void
    {
        abort_unless(
            (int) $demande->mairie_retrait_id === (int) $agent->mairie_id
                && $agent->peutReceptionnerRetrait(),
            403,
            "Seul un agent habilité de la Mairie de retrait peut effectuer cette action."
        );
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
