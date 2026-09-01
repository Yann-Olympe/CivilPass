<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

    public function mesDemandes(Request $request)
    {
        $demandes = $request->user()
            ->demandes()
            ->with(['filiation', 'mairieOrigine', 'mairieRetrait', 'transfert'])
            ->latest('date_creation')
            ->get();

        return response()->json($demandes);
    }
}
