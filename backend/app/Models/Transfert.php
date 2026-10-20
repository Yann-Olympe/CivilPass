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
        'valide_par_agent_id',
        'recu_par_agent_id',
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

    public function agentValidateur(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'valide_par_agent_id');
    }

    public function agentReceptionnaire(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'recu_par_agent_id');
    }
}
