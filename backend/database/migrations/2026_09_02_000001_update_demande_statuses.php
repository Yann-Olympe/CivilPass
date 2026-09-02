<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            if (! Schema::hasColumn('demandes', 'observation_origine')) {
                $table->text('observation_origine')->nullable();
            }

            if (! Schema::hasColumn('demandes', 'motif_statut')) {
                $table->text('motif_statut')->nullable();
            }
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->enum('statut', ['nouvelle', 'en_cours', 'validee', 'urgente', 'rejetee'])
                ->default('nouvelle')->change();
        });

        Schema::table('notifications', function (Blueprint $table) {
            if (! Schema::hasColumn('notifications', 'usager_id')) {
                $table->foreignId('usager_id')->nullable()->constrained('usagers')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['usager_id']);
            $table->dropColumn('usager_id');
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn('motif_statut');
            $table->enum('statut', [
                'pre_enrolee', 'en_attente_validation_origine', 'validee_origine',
                'transferee', 'disponible_retrait', 'remise',
            ])->default('pre_enrolee')->change();
        });
    }
};