<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Transfert;
use Illuminate\Http\Request;

class AgentDashboardController extends Controller
{
    // GET /api/agent/demandes — liste filtrée selon la mairie et le rôle de l'agent connecté
    public function index(Request $request)
    {
        $agent = $request->user();
        $query = Demande::with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert']);

        if ($agent->role === 'origine') {
            $query->where('mairie_origine_id', $agent->mairie_id);
        } elseif ($agent->role === 'retrait') {
            $query->where('mairie_retrait_id', $agent->mairie_id);
        } else {
            $query->where(function ($q) use ($agent) {
                $q->where('mairie_origine_id', $agent->mairie_id)
                  ->orWhere('mairie_retrait_id', $agent->mairie_id);
            });
        }

        return response()->json($query->latest('date_creation')->get());
    }

    // GET /api/agent/demandes/{id}
    public function show(Request $request, Demande $demande)
    {
        $this->autoriserAcces($request, $demande);

        return response()->json(
            $demande->load(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
        );
    }

    // POST /api/agent/demandes/{id}/valider
    // L'agent de la Mairie d'origine vérifie la souche et valide le transfert vers la Mairie de retrait.
    public function valider(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutValiderOrigine() && (int) $demande->mairie_origine_id === (int) $agent->mairie_id, 403,
            "Seul un agent de la Mairie d'origine peut valider cette demande.");

        abort_unless($demande->statut === 'en_attente_validation_origine', 409,
            "Cette demande n'est plus en attente de validation.");

        $demande->update(['statut' => 'validee_origine']);

        $transfert = Transfert::updateOrCreate(
            ['demande_id' => $demande->id],
            ['statut' => 'valide', 'date_validation_origine' => now()]
        );

        $demande->update(['statut' => 'transferee']);

        return response()->json([
            'demande' => $demande->fresh(),
            'transfert' => $transfert,
        ]);
    }

    // POST /api/agent/demandes/{id}/recevoir
    // L'agent de la Mairie de retrait confirme la réception du dossier transféré.
    public function recevoir(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutReceptionnerRetrait() && (int) $demande->mairie_retrait_id === (int) $agent->mairie_id, 403,
            "Seul un agent de la Mairie de retrait peut réceptionner ce dossier.");

        abort_unless($demande->statut === 'transferee', 409,
            "Ce dossier n'a pas encore été transféré par la Mairie d'origine.");

        $demande->update(['statut' => 'disponible_retrait']);

        $demande->transfert()->update([
            'statut' => 'recu',
            'date_reception_retrait' => now(),
        ]);

        return response()->json($demande->fresh()->load('transfert'));
    }

    // POST /api/agent/demandes/{id}/remettre
    // L'agent de la Mairie de retrait remet l'acte au citoyen (clôture le parcours).
    public function remettre(Request $request, Demande $demande)
    {
        $agent = $request->user();

        abort_unless($agent->peutReceptionnerRetrait() && (int) $demande->mairie_retrait_id === (int) $agent->mairie_id, 403);
        abort_unless($demande->statut === 'disponible_retrait', 409, "Le dossier n'est pas encore disponible.");

        $demande->update(['statut' => 'remise']);

        return response()->json($demande->fresh());
    }

    // POST /api/agent/scan — scan du QR Code : retrouve la demande à partir du token encodé
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
        $concerne = (int) $demande->mairie_origine_id === (int) $agent->mairie_id
            || (int) $demande->mairie_retrait_id === (int) $agent->mairie_id;

        abort_unless($concerne, 403, "Ce dossier ne concerne pas votre Mairie.");
    }
}
