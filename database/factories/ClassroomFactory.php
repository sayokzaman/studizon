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
        $status = $this->faker->randomElement(['scheduled', 'completed', 'cancelled', 'in_progress']);
        $start = match ($status) {
            'completed' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
            'in_progress' => $this->faker->dateTimeBetween('-2 hours', '-10 minutes'),
            default => $this->faker->dateTimeBetween('now', '+2 months'),
        };

        $end = (clone $start)->modify('+'.$this->faker->numberBetween(45, 120).' minutes');

        return [
            'course_id' => Course::inRandomOrder()->first()->id,
            'teacher_id' => User::inRandomOrder()->first()->id,
            'topic' => $this->faker->sentence(),
            'room_name' => $this->faker->unique()->bothify('???-####'), // has to be unique
            'is_live' => $status === 'in_progress',
            'record' => false,
            'join_link' => '',
            'description' => $this->faker->paragraph(),
            'cost' => $this->faker->numberBetween(0, 100),
            'capacity' => $this->faker->numberBetween(5, 30),
            'scheduled_date' => $start->format('Y-m-d'),
            'starts_at' => $start,
            'ends_at' => $end,
            'status' => $status,
            'thumbnail_path' => null,
        ];
    }
}
