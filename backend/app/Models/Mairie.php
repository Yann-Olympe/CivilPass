<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mairie extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'ville'];

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }

    public function demandesOrigine(): HasMany
    {
        return $this->hasMany(Demande::class, 'mairie_origine_id');
    }

    public function demandesRetrait(): HasMany
    {
        return $this->hasMany(Demande::class, 'mairie_retrait_id');
    }
}
