<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departments = [
            'CSE' => [
                'Introduction to Computer Science',
                'Programming Fundamentals',
                'Data Structures',
                'Algorithms',
                'Database Systems',
                'Software Engineering',
                'Computer Networks',
                'Operating Systems',
            ],
            'EEE' => [
                'Circuit Analysis',
                'Digital Electronics',
                'Power Systems',
                'Control Systems',
                'Electromagnetic Theory',
                'Signal Processing',
            ],
            'MAT' => [
                'Calculus I',
                'Calculus II',
                'Linear Algebra',
                'Differential Equations',
                'Discrete Mathematics',
                'Probability and Statistics',
            ],
        ];

        $dept = $this->faker->randomElement(array_keys($departments));

        return [
            'code' => $dept.'-'.$this->faker->numberBetween(1000, 4999),
            'name' => $this->faker->randomElement($departments[$dept]),
        ];
    }
}
