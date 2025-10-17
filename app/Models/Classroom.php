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
        'room_name',
        'is_live',
        'record',
        'join_link',
        'cost',
        'capacity',
        'description',
        'scheduled_date',
        'starts_at',
        'ends_at',
        'status',
        'thumbnail_path',
    ];

    protected $casts = [
        'is_live' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    protected $appends = [
        'capacity_filled',
        'start_time',
        'end_time',
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
        return $this->belongsToMany(User::class, 'classroom_user')->withTimestamps();
    }

    public function hasStudent(User $user)
    {
        return $this->students->contains($user->id);
    }

    public function isStudent(User $user): bool
    {
        return $this->students()->where('user_id', $user->id)->exists();
    }

    protected function capacityFilled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->students()->count(),
        );
    }

    protected function startTime(): Attribute
    {
        return Attribute::make(
            get: fn () => optional($this->starts_at)?->format('H:i:s')
        );
    }

    protected function endTime(): Attribute
    {
        return Attribute::make(
            get: fn () => optional($this->ends_at)?->format('H:i:s')
        );
    }
}
