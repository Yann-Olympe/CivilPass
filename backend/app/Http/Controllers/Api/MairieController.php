<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mairie;

class MairieController extends Controller
{
    // GET /api/mairies — liste des Mairies pour le formulaire de sélection
    public function index()
    {
        return response()->json(Mairie::select('id', 'nom', 'ville')->get());
    }
}
