<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->enum('statut', [
                'nouvelle', 'en_cours', 'validee', 'remise', 'urgente', 'rejetee', 'correction_demandee',
            ])->default('nouvelle')->change();
        });
    }

    public function down(): void
    {
        DB::table('demandes')
            ->where('statut', 'correction_demandee')
            ->update(['statut' => 'nouvelle']);

        Schema::table('demandes', function (Blueprint $table) {
            $table->enum('statut', ['nouvelle', 'en_cours', 'validee', 'remise', 'urgente', 'rejetee'])
                ->default('nouvelle')->change();
        });
    }
};
