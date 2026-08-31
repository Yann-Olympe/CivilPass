<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CitoyenAuthController extends Controller
{
    // POST /api/citoyen/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:usagers,telephone',
            'password' => 'required|string|min:6|confirmed', // attend password_confirmation
        ]);

        $usager = Usager::create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'telephone' => $data['telephone'],
            'password' => Hash::make($data['password']),
        ]);

        $token = $usager->createToken('citoyen-token')->plainTextToken;

        return response()->json(['usager' => $usager, 'token' => $token], 201);
    }

    // POST /api/citoyen/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'telephone' => 'required|string',
            'password' => 'required|string',
        ]);

        $usager = Usager::where('telephone', $data['telephone'])->first();

        if (! $usager || ! Hash::check($data['password'], $usager->password)) {
            throw ValidationException::withMessages([
                'telephone' => ['Identifiants invalides.'],
            ]);
        }

        $token = $usager->createToken('citoyen-token')->plainTextToken;

        return response()->json(['usager' => $usager, 'token' => $token]);
    }

    // POST /api/citoyen/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    // GET /api/citoyen/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // GET /api/citoyen/demandes — historique / suivi du citoyen connecté
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
