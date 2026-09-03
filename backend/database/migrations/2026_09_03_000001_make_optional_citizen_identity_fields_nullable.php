<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usagers', function (Blueprint $table) {
            $table->string('nui', 30)->nullable()->change();
            $table->string('cni_numero', 30)->nullable()->change();
            $table->string('cni_recto_path')->nullable()->change();
            $table->string('cni_verso_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('usagers', function (Blueprint $table) {
            $table->string('nui', 30)->nullable(false)->change();
            $table->string('cni_numero', 30)->nullable(false)->change();
            $table->string('cni_recto_path')->nullable(false)->change();
            $table->string('cni_verso_path')->nullable(false)->change();
        });
    }
};