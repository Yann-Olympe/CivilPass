<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\ChecklistController;
use App\Models\Demande;
use App\Models\Usager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CitoyenAuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:usagers',
            'email' => 'required|email|unique:usagers',
            'password' => 'required|string|min:6|confirmed',
            'date_naissance' => 'required|date',
            'lieu_naissance' => 'required|string|max:150',
            'sexe' => 'required|in:M,F',
            'nationalite' => 'required|string|max:100',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'region' => 'required|string|max:100',
            'nui' => 'nullable|string|max:30|unique:usagers',
            'cni_numero' => 'nullable|string|max:30',
        ]);

        $usager = Usager::create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'telephone' => $data['telephone'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'date_naissance' => $data['date_naissance'],
            'lieu_naissance' => $data['lieu_naissance'],
            'sexe' => $data['sexe'],
            'nationalite' => $data['nationalite'],
            'adresse' => $data['adresse'],
            'ville' => $data['ville'],
            'region' => $data['region'],
            'nui' => $data['nui'] ?? null,
            'cni_numero' => $data['cni_numero'] ?? null,
        ]);

        $token = $usager->createToken('citoyen-token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès',
            'usager' => $usager,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required_without:telephone|email',
            'telephone' => 'required_without:email|string',
            'password' => 'required|string',
        ], [
            'email.required_without' => 'Email ou téléphone requis',
            'telephone.required_without' => 'Email ou téléphone requis',
        ]);

        // Chercher par email OU téléphone
        $usager = Usager::where('email', $data['email'] ?? null)
            ->orWhere('telephone', $data['telephone'] ?? null)
            ->first();

        if (! $usager || ! $usager->password || ! Hash::check($data['password'], $usager->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        $token = $usager->createToken('citoyen-token')->plainTextToken;

        return response()->json(['usager' => $usager, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $usager = $request->user();

        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'telephone' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('usagers')->ignore($usager->id)],
            'email' => ['sometimes', 'required', 'email', Rule::unique('usagers')->ignore($usager->id)],
            'date_naissance' => 'sometimes|required|date',
            'lieu_naissance' => 'sometimes|required|string|max:150',
            'sexe' => 'sometimes|required|in:M,F',
            'nationalite' => 'sometimes|required|string|max:100',
            'adresse' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|required|string|max:100',
            'region' => 'sometimes|required|string|max:100',
            'nui' => ['sometimes', 'nullable', 'string', 'max:30', Rule::unique('usagers')->ignore($usager->id)],
            'cni_numero' => 'sometimes|nullable|string|max:30',
        ]);

        $usager->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'usager' => $usager->fresh(),
        ]);
    }

    public function mesDemandes(Request $request)
    {
        $query = $request->user()->demandes()
            ->with(['filiation', 'mairieOrigine', 'mairieRetrait', 'transfert']);

        $filtre = $request->query('filtre', 'toutes');
        abort_unless(in_array($filtre, ['toutes', 'actives', 'pretes'], true), 422,
            'Le filtre doit être toutes, actives ou pretes.');

        if ($filtre === 'actives') {
            $query->whereIn('statut', ['nouvelle', 'en_cours', 'urgente']);
        } elseif ($filtre === 'pretes') {
            $query->where('statut', 'validee');
        }

        if ($recherche = $request->query('recherche')) {
            $query->where(function ($demandeQuery) use ($recherche) {
                $demandeQuery->where('id', $recherche)
                    ->orWhere('type_demande', 'like', "%{$recherche}%")
                    ->orWhereHas('mairieOrigine', fn ($mairieQuery) => $mairieQuery
                        ->where('nom', 'like', "%{$recherche}%")
                        ->orWhere('ville', 'like', "%{$recherche}%"))
                    ->orWhereHas('mairieRetrait', fn ($mairieQuery) => $mairieQuery
                        ->where('nom', 'like', "%{$recherche}%")
                        ->orWhere('ville', 'like', "%{$recherche}%"));
            });
        }

        $demandes = $query->latest('date_creation')->get();

        return response()->json($demandes);
    }

    public function detailDemande(Request $request, Demande $demande)
    {
        abort_unless($demande->usager_id === $request->user()->id, 404);

        $demande->load(['filiation', 'mairieOrigine', 'mairieRetrait', 'transfert']);
        $donnees = $demande->toArray();
        $donnees['checklist'] = ChecklistController::forType($demande->type_demande);

        return response()->json($donnees);
    }

    public function dashboard(Request $request)
    {
        $usager = $request->user();
        $demandes = $usager->demandes();
        $annee = (int) $request->integer('annee', now()->year);

        $pretARetirer = (clone $demandes)->where('statut', 'validee')->count();

        $mensuelles = (clone $demandes)
            ->whereYear('date_creation', $annee)
            ->get(['date_creation'])
            ->countBy(fn (Demande $demande) => $demande->date_creation->month);

        $alerte = (clone $demandes)
            ->where('statut', 'validee')
            ->with('mairieRetrait')
            ->latest('date_creation')
            ->first();

        return response()->json([
            'compteurs' => [
                'en_cours' => (clone $demandes)->whereIn('statut', ['nouvelle', 'en_cours', 'urgente'])->count(),
                'pret_a_retirer' => $pretARetirer,
                'historique' => (clone $demandes)->count(),
            ],
            'alerte' => $alerte ? [
                'demande_id' => $alerte->id,
                'message' => 'Votre acte est prêt à être retiré.',
                'mairie_retrait' => $alerte->mairieRetrait,
            ] : null,
            'statistiques' => [
                'annee' => $annee,
                'demandes_par_mois' => collect(range(1, 12))->mapWithKeys(
                    fn (int $mois) => [$mois => (int) ($mensuelles[$mois] ?? 0)]
                ),
            ],
        ]);
    }
}
