<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $table = 'ratings';

    protected $fillable = [
        'user_id',
        'rated_by',
        'classroom_id',
        'rating',
    ];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ratedBy()
    {
        return $this->belongsTo(User::class, 'rated_by');
    }
}
