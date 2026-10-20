<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Mairie;
use Illuminate\Database\Seeder;

class MarouaMairieSeeder extends Seeder
{
    public function run(): void
    {
        $mairie = Mairie::firstOrCreate(
            ['nom' => 'Mairie de Maroua Ier'],
            ['ville' => 'Maroua']
        );

        Agent::where('email', 'maroua1@gmail.com')->update([
            'mairie_id' => $mairie->id,
            'role' => 'les_deux',
        ]);
    }
}
