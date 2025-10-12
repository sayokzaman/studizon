<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // ensure start is in the future and end is after start
        $start = Carbon::now()->addMinutes(rand(10, 1440)); // 10 minutes to 24 hours from now
        $end = (clone $start)->addMinutes(rand(30, 240));

        return [
            'course_id' => Course::factory(),
            'teacher_id' => User::factory(),
            'topic' => $this->faker->sentence(),
            'join_link' => $this->faker->url(),
            'description' => $this->faker->paragraph(),
            'cost' => $this->faker->numberBetween(0, 100),
            'capacity' => $this->faker->numberBetween(5, 30),
            'scheduled_date' => $this->faker->date(),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'status' => 'scheduled',
            'thumbnail_path' => null,
        ];
    }
}
