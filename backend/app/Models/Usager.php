<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usager extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = ['nom', 'prenom', 'telephone', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }
}
