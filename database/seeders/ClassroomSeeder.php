<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Course;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Course::query()
            ->select('id')
            ->each(function (Course $course): void {
                Classroom::factory()
                    ->count(2)
                    ->create([
                        'course_id' => $course->id,
                    ]);
            });
    }
}
