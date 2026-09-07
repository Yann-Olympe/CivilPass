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

    public function peutValiderOrigine(): bool
    {
        return in_array($this->role, ['origine', 'les_deux']);
    }

    public function peutReceptionnerRetrait(): bool
    {
        return in_array($this->role, ['retrait', 'les_deux']);
    }
}
