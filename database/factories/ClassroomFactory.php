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
        return [
            'course_id' => Course::inRandomOrder()->first()->id,
            'teacher_id' => User::inRandomOrder()->first()->id,
            'topic' => $this->faker->sentence(),
            'room_name' => $this->faker->unique()->bothify('???-####'), // has to be unique
            'is_live' => false,
            'record' => false,
            'join_link' => '',
            'description' => $this->faker->paragraph(),
            'cost' => $this->faker->numberBetween(0, 100),
            'capacity' => $this->faker->numberBetween(5, 30),
            'scheduled_date' => $this->faker->date(),
            'starts_at' => $this->faker->dateTimeThisMonth(),
            'ends_at' => $this->faker->dateTimeThisMonth(),
            'status' => 'scheduled',
            'thumbnail_path' => null,
        ];
    }
}
