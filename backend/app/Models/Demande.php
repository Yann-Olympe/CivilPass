<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Demande extends Model
{
    use HasFactory;

    public const STATUTS = ['nouvelle', 'en_cours', 'validee', 'urgente', 'rejetee'];

    protected $fillable = [
        'type_demande',
        'statut',
        'numero_acte',
        'annee_acte',
        'qr_token',
        'souche_retrouvee',
        'observation_origine',
        'motif_statut',
        'usager_id',
        'mairie_origine_id',
        'mairie_retrait_id',
        'date_creation',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'souche_retrouvee' => 'boolean',
        ];
    }

    public function usager(): BelongsTo
    {
        return $this->belongsTo(Usager::class);
    }

    public function mairieOrigine(): BelongsTo
    {
        return $this->belongsTo(Mairie::class, 'mairie_origine_id');
    }

    public function mairieRetrait(): BelongsTo
    {
        return $this->belongsTo(Mairie::class, 'mairie_retrait_id');
    }

    public function filiation(): HasOne
    {
        return $this->hasOne(Filiation::class);
    }

    public function transfert(): HasOne
    {
        return $this->hasOne(Transfert::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
