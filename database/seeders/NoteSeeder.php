<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run()
    {
        // Get or create some users and courses to associate with notes
        $users = User::take(3)->get();
        $courses = Course::take(3)->get();

        // $courseIds = Course::pluck('id')->take(3)->toArray();

        // Create 10 notes without any attachments
        Note::factory()
            ->count(10)
            ->sequence(
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
                ['user_id' => $users->random()->id, 'course_id' => $courses->random()->id],
            )
            ->create();
    }
}
