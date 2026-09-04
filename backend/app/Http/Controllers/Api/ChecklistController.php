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

    public static function forType(string $typeDemande): ?array
    {
        $pieces = self::CHECKLISTS[$typeDemande] ?? null;

        return $pieces ? [
            'type_demande' => $typeDemande,
            'pieces_requises' => $pieces,
        ] : null;
    }

    public function show(string $typeDemande)
    {
        $checklist = self::forType($typeDemande);

        if (! $checklist) {
            return response()->json(['message' => 'Type de démarche inconnu.'], 404);
        }

        return response()->json($checklist);
    }
}
