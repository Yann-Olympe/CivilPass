<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->string('email', 150)->unique();
            $table->string('password');
            $table->foreignId('mairie_id')->constrained('mairies')->cascadeOnDelete();
            $table->enum('role', ['origine', 'retrait', 'les_deux'])->default('les_deux');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
