<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/auth/login — connexion d'un agent de mairie
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $agent = Agent::where('email', $data['email'])->first();

        if (! $agent || ! Hash::check($data['password'], $agent->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        $token = $agent->createToken('agent-token')->plainTextToken;

        return response()->json([
            'agent' => $agent->load('mairie'),
            'token' => $token,
        ]);
    }

    // POST /api/auth/logout — déconnexion (révoque le token courant)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    // GET /api/auth/me — profil de l'agent connecté
    public function me(Request $request)
    {
        return response()->json($request->user()->load('mairie'));
    }
}
