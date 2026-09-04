<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\ChecklistController;
use App\Models\Demande;
use App\Models\Filiation;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DemandeController extends Controller
{
    // POST /api/demandes — protégée par auth:sanctum (citoyen connecté requis)
    public function store(Request $request)
    {
        $data = $request->validate([
            'mairie_origine_id' => 'required|exists:mairies,id',
            'mairie_retrait_id' => 'required|exists:mairies,id|different:mairie_origine_id',
            'numero_acte' => 'nullable|string|max:50',
            'annee_acte' => 'nullable|integer|min:1900|max:' . date('Y'),
            'filiation.pere_nom' => 'nullable|string|max:150',
            'filiation.mere_nom' => 'nullable|string|max:150',
        ]);

        $usager = $request->user();

        $demande = Demande::create([
            'type_demande' => 'naissance',
            'statut' => 'nouvelle',
            'motif_statut' => 'Votre demande a été enregistrée et attend son traitement.',
            'numero_acte' => $data['numero_acte'] ?? null,
            'annee_acte' => $data['annee_acte'] ?? null,
            'qr_token' => (string) Str::uuid(),
            'usager_id' => $usager->id,
            'mairie_origine_id' => $data['mairie_origine_id'],
            'mairie_retrait_id' => $data['mairie_retrait_id'],
            'date_creation' => now(),
        ]);

        Filiation::create([
            'demande_id' => $demande->id,
            'pere_nom' => $data['filiation']['pere_nom'] ?? null,
            'mere_nom' => $data['filiation']['mere_nom'] ?? null,
        ]);

        Notification::create([
            'mairie_id' => $demande->mairie_origine_id,
            'usager_id' => $demande->usager_id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
            'message' => "Votre demande n°{$demande->id} est nouvelle : elle a été enregistrée et attend son traitement.",
        ]);

        return response()->json(
            $demande->load(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait']),
            201
        );
    }

    public function show(string $qrToken)
    {
        $demande = Demande::where('qr_token', $qrToken)
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
            ->firstOrFail();

        return response()->json($this->avecChecklist($demande));
    }

    public function pdf(string $qrToken)
    {
        $demande = Demande::where('qr_token', $qrToken)
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait'])
            ->firstOrFail();

        return $this->genererPdf($demande);
    }

    public function pdfCitoyen(Request $request, Demande $demande)
    {
        abort_unless($demande->usager_id === $request->user()->id, 404);

        $demande->load(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait']);

        return $this->genererPdf($demande);
    }

    private function genererPdf(Demande $demande)
    {
        $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(200)->generate($demande->qr_token);

        $pdf = \PDF::loadView('pdf.recapitulatif', compact('demande', 'qrSvg'));

        return $pdf->download("recapitulatif-{$demande->id}.pdf");
    }

    private function avecChecklist(Demande $demande): array
    {
        $donnees = $demande->toArray();
        $donnees['checklist'] = ChecklistController::forType($demande->type_demande);

        return $donnees;
    }
}
