<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usager extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'nom', 'prenom', 'date_naissance', 'lieu_naissance', 'sexe', 'nationalite',
        'telephone', 'email', 'adresse', 'ville', 'region',
        'nui', 'cni_numero', 'cni_recto_path', 'cni_verso_path',
        'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'date_naissance' => 'date',
        ];
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }
}
