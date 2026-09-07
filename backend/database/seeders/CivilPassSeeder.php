<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Mairie;
use Illuminate\Database\Seeder;

class CivilPassSeeder extends Seeder
{
    public function run(): void
    {
        $douala = Mairie::create([
            'nom' => 'Mairie de Douala 3e',
            'ville' => 'Douala',
        ]);

        $yaounde = Mairie::create([
            'nom' => 'Mairie de Yaoundé 1er',
            'ville' => 'Yaoundé',
        ]);

        Agent::create([
            'nom' => 'Agent Origine',
            'email' => 'origine@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $douala->id,
            'role' => 'origine',
        ]);

        Agent::create([
            'nom' => 'Agent Retrait',
            'email' => 'retrait@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $yaounde->id,
            'role' => 'retrait',
        ]);
    }
}
