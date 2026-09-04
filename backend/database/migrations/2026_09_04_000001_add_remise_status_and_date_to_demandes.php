<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            if (! Schema::hasColumn('demandes', 'date_remise')) {
                $table->timestamp('date_remise')->nullable();
            }
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->enum('statut', [
                'nouvelle', 'en_cours', 'validee', 'remise', 'urgente', 'rejetee',
            ])->default('nouvelle')->change();
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->enum('statut', ['nouvelle', 'en_cours', 'validee', 'urgente', 'rejetee'])
                ->default('nouvelle')->change();
            $table->dropColumn('date_remise');
        });
    }
};