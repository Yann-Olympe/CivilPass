<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    // Config statique (MVP) : facile à transformer en table BDD plus tard
    // si de nouveaux types de démarches (mariage, décès) sont ajoutés.
    private const CHECKLISTS = [
        'naissance' => [
            "Numéro de l'acte de naissance (si connu)",
            "Nom et prénom du père",
            "Nom et prénom de la mère",
            "Pièce d'identité du demandeur (CNI ou récépissé)",
            "Justificatif de lien avec le titulaire de l'acte, si applicable",
        ],
    ];

    // GET /api/checklist/{type_demande}
    public function show(string $typeDemande)
    {
        $pieces = self::CHECKLISTS[$typeDemande] ?? null;

        if (! $pieces) {
            return response()->json(['message' => 'Type de démarche inconnu.'], 404);
        }

        return response()->json(['type_demande' => $typeDemande, 'pieces_requises' => $pieces]);
    }
}
