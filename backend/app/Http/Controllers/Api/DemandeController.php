<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Filiation;
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
            'statut' => 'en_attente_validation_origine',
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

        return response()->json($demande);
    }

    public function pdf(string $qrToken)
    {
        $demande = Demande::where('qr_token', $qrToken)
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait'])
            ->firstOrFail();

        $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(200)->generate($demande->qr_token);

        $pdf = \PDF::loadView('pdf.recapitulatif', compact('demande', 'qrSvg'));

        return $pdf->download("recapitulatif-{$demande->id}.pdf");
    }
}
