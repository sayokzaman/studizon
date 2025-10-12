<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => $this->faker->randomElement(['CSE', 'EEE', 'MAT']),
            'code' => $this->faker->unique()->bothify('???-####'),
            'name' => $this->faker->unique()->company(),
        ];
    }
}
