<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classrooms = Classroom::query()
            ->with('students:id')
            ->get(['id', 'teacher_id']);

        if ($classrooms->isEmpty()) {
            return;
        }

        $allUsers = User::query()->pluck('id');

        foreach ($classrooms as $classroom) {
            $candidateRaters = $classroom->students
                ->pluck('id')
                ->filter(fn (int $id): bool => $id !== $classroom->teacher_id)
                ->values();

            if ($candidateRaters->isEmpty()) {
                $candidateRaters = $allUsers
                    ->filter(fn (int $id): bool => $id !== $classroom->teacher_id)
                    ->values();
            }

            if ($candidateRaters->isEmpty()) {
                continue;
            }

            $ratingCount = min(
                $candidateRaters->count(),
                fake()->numberBetween(1, 6)
            );

            foreach ($candidateRaters->random($ratingCount) as $ratedBy) {
                Rating::query()->create([
                    'user_id' => $classroom->teacher_id,
                    'rated_by' => $ratedBy,
                    'classroom_id' => $classroom->id,
                    'rating' => fake()->numberBetween(1, 5),
                ]);
            }
        }
    }
}
