<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Filiation;
use App\Models\Usager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DemandeController extends Controller
{
    // POST /api/demandes
    // Crée l'usager (ou le réutilise via téléphone) + la demande + la filiation.
    // Couvre à la fois le pré-enrôlement (Parcours A) et la demande à distance (Parcours B),
    // car dans ce MVP toute demande passe par le choix d'une Mairie d'origine et de retrait.
    public function store(Request $request)
    {
        $data = $request->validate([
            'usager.nom' => 'required|string|max:100',
            'usager.prenom' => 'required|string|max:100',
            'usager.telephone' => 'required|string|max:20',
            'mairie_origine_id' => 'required|exists:mairies,id',
            'mairie_retrait_id' => 'required|exists:mairies,id|different:mairie_origine_id',
            'numero_acte' => 'nullable|string|max:50',
            'annee_acte' => 'nullable|integer|min:1900|max:' . date('Y'),
            'filiation.pere_nom' => 'nullable|string|max:150',
            'filiation.mere_nom' => 'nullable|string|max:150',
        ]);

        $usager = Usager::firstOrCreate(
            ['telephone' => $data['usager']['telephone']],
            ['nom' => $data['usager']['nom'], 'prenom' => $data['usager']['prenom']]
        );

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

    // GET /api/demandes/{qrToken} — récapitulatif consulté via le QR Code / le suivi
    public function show(string $qrToken)
    {
        $demande = Demande::where('qr_token', $qrToken)
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
            ->firstOrFail();

        return response()->json($demande);
    }

    // GET /api/demandes/{qrToken}/pdf — génère le récapitulatif PDF avec QR Code
    // NB: nécessite le package `barryvdh/laravel-dompdf` (ou `niklasravnsborg/laravel-pdf`)
    // + `simplesoftwareio/simple-qrcode` — à installer via composer côté équipe backend.
    public function pdf(string $qrToken)
    {
        $demande = Demande::where('qr_token', $qrToken)
            ->with(['usager', 'filiation', 'mairieOrigine', 'mairieRetrait'])
            ->firstOrFail();

        $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(200)->generate($demande->qr_token);

        $pdf = \PDF::loadView('pdf.recapitulatif', compact('demande', 'qrSvg'));

        return $pdf->download("recapitulatif-{$demande->id}.pdf");
    }
}
