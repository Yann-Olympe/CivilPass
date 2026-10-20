<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $doublons = DB::table('transferts')
            ->select('demande_id')
            ->groupBy('demande_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('demande_id');

        if ($doublons->isNotEmpty()) {
            throw new RuntimeException(
                'Contrainte unique transferts.demande_id impossible : doublons détectés pour les demandes '
                . $doublons->implode(', ')
                . '. Aucune ligne n’a été supprimée ; corrigez ces doublons explicitement avant de relancer la migration.'
            );
        }

        Schema::table('transferts', function (Blueprint $table) {
            $table->foreignId('valide_par_agent_id')
                ->nullable()
                ->constrained('agents')
                ->restrictOnDelete();
            $table->foreignId('recu_par_agent_id')
                ->nullable()
                ->constrained('agents')
                ->restrictOnDelete();
            $table->unique('demande_id');
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->foreignId('remis_par_agent_id')
                ->nullable()
                ->constrained('agents')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('remis_par_agent_id');
        });

        Schema::table('transferts', function (Blueprint $table) {
            $table->dropUnique(['demande_id']);
            $table->dropConstrainedForeignId('valide_par_agent_id');
            $table->dropConstrainedForeignId('recu_par_agent_id');
        });
    }
};
