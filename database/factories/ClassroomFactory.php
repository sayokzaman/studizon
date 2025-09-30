<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
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
        return [
            'course_id' => Course::factory(),
            'teacher_id' => User::factory(),
            'topic' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'cost' => $this->faker->numberBetween(0, 100),
            'capacity' => $this->faker->numberBetween(5, 30),
            'scheduled_date' => $this->faker->date(),
            'start_time' => $this->faker->time(),
            'end_time' => $this->faker->time(),
            'status' => 'scheduled',
            'thumbnail_path' => null,
        ];
    }
}
