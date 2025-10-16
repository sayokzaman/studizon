<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    public function join(User $user, Classroom $classroom): bool
    {
        // Teacher can always join; students only if enrolled AND it's live
        if ($classroom->teacher_id === $user->id) {
            return true;
        }

        $isEnrolled = $classroom->members()
            ->where('user_id', $user->id)
            ->exists();

        if (! $isEnrolled) {
            return false;
        }

        return $classroom->is_live === true;
    }

    public function start(User $user, Classroom $classroom): bool
    {
        return $classroom->teacher_id === $user->id;
    }

    public function end(User $user, Classroom $classroom): bool
    {
        return $classroom->teacher_id === $user->id;
    }
}
