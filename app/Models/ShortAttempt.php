<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShortAttempt extends Model
{
    protected $fillable = [
        'short_id',
        'user_id',
        'answer',
        'is_correct',
        'time_taken',
        'points_awarded',
    ];

    protected $casts = [
        'answer' => 'array',
        'is_correct' => 'boolean',
    ];

    public function short(): BelongsTo
    {
        return $this->belongsTo(Short::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
