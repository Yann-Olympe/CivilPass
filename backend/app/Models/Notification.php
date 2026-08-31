<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = ['mairie_id', 'demande_id', 'type', 'message', 'lue'];

    protected function casts(): array
    {
        return ['lue' => 'boolean'];
    }

    public function mairie(): BelongsTo
    {
        return $this->belongsTo(Mairie::class);
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }
}
