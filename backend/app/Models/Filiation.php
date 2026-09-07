<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Filiation extends Model
{
    use HasFactory;

    protected $fillable = ['demande_id', 'pere_nom', 'mere_nom'];

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }
}
