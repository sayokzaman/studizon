<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition()
    {
        $creator = User::inRandomOrder()->first() ?? User::factory()->create();
        $course  = Course::inRandomOrder()->first() ?? Course::factory()->create();

        return [
            'user_id' => $creator->id,
            'course_id' => $course->id,
            'description' => $this->faker->sentence(),
        ];
    }    
}