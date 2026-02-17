<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class ClassroomStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classrooms = Classroom::query()
            ->with([
                'course.students:id',
                'students:id',
            ])
            ->get(['id', 'course_id', 'teacher_id', 'capacity']);

        if ($classrooms->isEmpty()) {
            return;
        }

        $allUserIds = User::query()->pluck('id');

        foreach ($classrooms as $classroom) {
            $candidateIds = $classroom->course?->students?->pluck('id') ?? collect();

            if ($candidateIds->isEmpty()) {
                $candidateIds = $allUserIds;
            }

            $candidateIds = $candidateIds
                ->filter(fn (int $id): bool => $id !== $classroom->teacher_id)
                ->unique()
                ->values();

            if ($candidateIds->isEmpty()) {
                continue;
            }

            $availableSeats = max(0, $classroom->capacity - $classroom->students->count());

            if ($availableSeats === 0) {
                continue;
            }

            $maxToAttach = min($candidateIds->count(), $availableSeats);
            $attachCount = fake()->numberBetween(1, $maxToAttach);

            $studentPayload = $this->buildStudentPayload(
                $candidateIds->random($attachCount)
            );

            $classroom->students()->syncWithoutDetaching($studentPayload);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int>  $studentIds
     * @return array<int, array{role: string}>
     */
    private function buildStudentPayload(Collection $studentIds): array
    {
        return $studentIds
            ->mapWithKeys(fn (int $id): array => [$id => ['role' => 'student']])
            ->all();
    }
}
