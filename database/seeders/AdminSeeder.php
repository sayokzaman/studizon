<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1️⃣ Create Admin User
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@email.com',
            'password' => Hash::make('password'),
            'credits' => 1000, // optional if you’re using credits system
        ]);

        // // 2️⃣ Create Courses if none exist
        // if (Course::count() === 0) {
        //     Course::factory()->count(5)->create(); // assuming you have a factory
        // }

        // // 3️⃣ Get some course IDs (first 3)
        // $courseIds = Course::pluck('id')->take(3)->toArray();

        // foreach ($courseIds as $courseId) {
        //     // create 1 classroom per course (adjust count or attributes as needed)
        //     Classroom::factory()->create([
        //         'course_id' => $courseId,
        //     ]);
        // }

        // // 4️⃣ Attach courses to admin
        // $admin->courses()->attach($courseIds);

        // // 5️⃣ Optional: Output confirmation
        // $this->command->info('✅ Admin seeded with 3 courses attached.');
    }
}
