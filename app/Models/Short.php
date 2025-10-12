<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Short extends Model
{
    use HasFactory;

    protected $table = 'shorts';

    protected $fillable = [
        'creator_id',
        'course_id',
        'type',
        'prompt',
        'payload',
        'validate',
        'background',
        'time_limit',
        'max_points',
        'visibility',
        'tags',
    ];

    protected $casts = [
        'payload' => 'array',
        'validate' => 'array',
        'tags' => 'array',
        'time_limit' => 'integer',
        'max_points' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function attempts()
    {
        return $this->hasMany(ShortAttempt::class);
    }
}
