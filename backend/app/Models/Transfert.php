<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transfert extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'statut',
        'date_validation_origine',
        'date_reception_retrait',
    ];

    protected function casts(): array
    {
        return [
            'date_validation_origine' => 'datetime',
            'date_reception_retrait' => 'datetime',
        ];
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }
}
