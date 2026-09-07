<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->enum('type_demande', ['naissance'])->default('naissance');
            $table->enum('statut', [
                'pre_enrolee',
                'en_attente_validation_origine',
                'validee_origine',
                'transferee',
                'disponible_retrait',
                'remise',
            ])->default('pre_enrolee');
            $table->string('numero_acte', 50)->nullable();
            $table->smallInteger('annee_acte')->nullable();
            $table->string('qr_token', 64)->unique();
            $table->boolean('souche_retrouvee')->nullable();
            $table->text('observation_origine')->nullable();
            $table->foreignId('usager_id')->constrained('usagers')->cascadeOnDelete();
            $table->foreignId('mairie_origine_id')->constrained('mairies');
            $table->foreignId('mairie_retrait_id')->constrained('mairies');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
