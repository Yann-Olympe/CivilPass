<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ChecklistController extends Controller
{
    private const CHECKLISTS = [
        'naissance' => [
            "Numéro de l'acte de naissance (si connu)",
            "Nom et prénom du père",
            "Nom et prénom de la mère",
            "Pièce d'identité du demandeur (CNI ou récépissé)",
            "Justificatif de lien avec le titulaire de l'acte, si applicable",
        ],
    ];

    public function show(string $typeDemande)
    {
        $pieces = self::CHECKLISTS[$typeDemande] ?? null;

        if (! $pieces) {
            return response()->json(['message' => 'Type de démarche inconnu.'], 404);
        }

        return response()->json(['type_demande' => $typeDemande, 'pieces_requises' => $pieces]);
    }
}
