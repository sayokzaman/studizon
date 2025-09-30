<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

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

    protected $appends = [
        'capacity_filled',
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

    protected function capacityFilled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->students()->count(),
        );
    }
}
