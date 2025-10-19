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

    protected $appends = [
        'is_following',
        'follower_count',
        'following_count',
        'shorts_count',
        'classrooms_count',
        'rating',
    ];

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
        return $this->belongsToMany(Classroom::class, 'classroom_user')->withTimestamps();
    }

    public function getClassroomsCountAttribute()
    {
        return $this->classrooms()->count();
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

    public function shorts()
    {
        return $this->hasMany(Short::class, 'creator_id');
    }

    public function getShortsCountAttribute(): int
    {
        return $this->shorts()->count();
    }

    public function followers()
    {
        return $this->hasMany(Follower::class, 'following_id');
    }

    public function getFollowerCountAttribute(): int
    {
        return $this->followers()->count();
    }

    public function following()
    {
        return $this->hasMany(Follower::class, 'follower_id');
    }

    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function getRatingAttribute(): float
    {   
        // get average rating if exists 
        if ($this->ratings()->exists()) {
            return $this->ratings()->avg('rating');
        }
        return 0.0;
    }

    // make an attribute is_following
    public function getIsFollowingAttribute(): bool
    {
        $authUser = Auth::user();

        if (! $authUser || $authUser->id === $this->id) {
            return false;
        }

        return $authUser->following()->where('following_id', $this->id)->exists();
    }
}
