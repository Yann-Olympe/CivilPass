<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mairie_id')->constrained('mairies')->cascadeOnDelete();
            $table->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $table->string('type', 50); // ex: 'nouvelle_demande_a_valider', 'dossier_transfere', 'dossier_recu'
            $table->string('message', 255);
            $table->boolean('lue')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
