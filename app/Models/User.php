<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'program_id',
        'credits',
        'profile_completed',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'credits' => 'integer',
            'profile_completed' => 'boolean',
        ];
    }

    protected $appends = ['is_following'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_user')->withTimestamps();
    }

    public function classrooms()
    {
        // Through courses
        return $this->hasManyThrough(Classroom::class, Course::class);
    }

    public function joinedClassrooms()
    {
        return $this->belongsToMany(Classroom::class);
    }

    public function deductCredits($amount)
    {
        $this->decrement('credits', $amount);
    }

    public function addCredits($amount)
    {
        $this->increment('credits', $amount);
    }

    public function followers()
    {
        return $this->hasMany(Follower::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(Follower::class, 'follower_id');
    }

    // make an attribute is_following
    public function getIsFollowingAttribute(): bool
    {
        $authUser = Auth::user();

        if (!$authUser || $authUser->id === $this->id) {
            return false;
        }

        return $authUser->following()->where('following_id', $this->id)->exists();
    }
}
