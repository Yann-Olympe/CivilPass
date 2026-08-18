<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mairies', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->string('ville', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mairies');
    }
};
