<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Agent extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = ['nom', 'email', 'password', 'mairie_id', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function mairie(): BelongsTo
    {
        return $this->belongsTo(Mairie::class);
    }

    // Un agent "origine" ou "les_deux" peut valider les demandes sortantes
    public function peutValiderOrigine(): bool
    {
        return in_array($this->role, ['origine', 'les_deux']);
    }

    // Un agent "retrait" ou "les_deux" peut réceptionner les dossiers transférés
    public function peutReceptionnerRetrait(): bool
    {
        return in_array($this->role, ['retrait', 'les_deux']);
    }
}
