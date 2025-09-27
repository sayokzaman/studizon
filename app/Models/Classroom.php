<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    protected $fillable = [
        'course_id',
        'teacher_id',
        'topic',
        'cost',
        'capacity',
        'description',
        'scheduled_date',
        'start_time',
        'end_time',
        'status',
        'thumbnail_path',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}
