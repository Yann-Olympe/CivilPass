<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usagers', function (Blueprint $table) {
            // 1. Identité
            $table->date('date_naissance')->after('prenom');
            $table->string('lieu_naissance', 150)->after('date_naissance');
            $table->enum('sexe', ['M', 'F'])->after('lieu_naissance');
            $table->string('nationalite', 100)->default('Camerounaise')->after('sexe');

            // 2. Coordonnées
            $table->string('email', 150)->unique()->after('telephone');
            $table->string('adresse', 255)->after('email');
            $table->string('ville', 100)->after('adresse');
            $table->string('region', 100)->after('ville');

            // 3. Informations d'identification
            $table->string('nui', 30)->unique()->after('region');
            $table->string('cni_numero', 30)->after('nui');
            $table->string('cni_recto_path')->after('cni_numero');
            $table->string('cni_verso_path')->after('cni_recto_path');
        });
    }

    public function down(): void
    {
        Schema::table('usagers', function (Blueprint $table) {
            $table->dropColumn([
                'date_naissance', 'lieu_naissance', 'sexe', 'nationalite',
                'email', 'adresse', 'ville', 'region',
                'nui', 'cni_numero', 'cni_recto_path', 'cni_verso_path',
            ]);
        });
    }
};
