<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Short>
 */
class ShortFactory extends Factory
{
    /**
     * Default: MCQ (text/image mix), like your current implementation.
     */
    public function definition(): array
    {
        $creator = User::inRandomOrder()->first() ?? User::factory()->create();
        $course  = Course::inRandomOrder()->first() ?? Course::factory()->create();

        // 60% text-only, 30% mix, 10% image-only
        $mode = fake()->randomElement(['text','mix','image','text','text']);

        $numChoices = fake()->numberBetween(3, 4);
        $choices = [];
        for ($i = 0; $i < $numChoices; $i++) {
            $useImg = ($mode === 'image') || ($mode === 'mix' && fake()->boolean());
            $choices[] = [
                'text' => $useImg ? null : fake()->randomElement([
                    'map()','filter()','reduce()','forEach()','slice()','splice()',
                ]),
                'img'  => $useImg ? 'https://avatar.iran.liara.run/public/'.fake()->numberBetween(1, 20) : null,
                'alt'  => $useImg ? fake()->words(3, true) : null,
            ];
        }

        $correctIndex = fake()->numberBetween(0, $numChoices - 1);

        return [
            'creator_id' => $creator->id,
            'course_id'  => $course->id,
            'type'       => 'mcq',
            'prompt'     => fake()->randomElement([
                'Which array method combines all elements into a single value?',
                'Pick the reducer:',
                'Choose the correct JS method to accumulate values.',
            ]),
            'payload'    => ['choices' => $choices],
            'validate'   => ['mode' => 'mcq', 'correctIndex' => $correctIndex],
            'background' => fake()->randomElement([
                'solid:#0f172a',
                'grad:linear:#0ea5e9,#22d3ee',
                'grad:radial:#4338ca,#a78bfa',
            ]),
            'time_limit' => fake()->numberBetween(8, 15),
            'max_points' => 1,
            'visibility' => 'public',
            'tags'       => ['js','arrays'],
        ];
    }

    /**
     * MCQ text-only convenience (keeps your existing helper).
     */
    public function textOnly(): static
    {
        return $this->state(fn () => [
            'payload' => [
                'choices' => collect(range(1, 4))->map(fn () => [
                    'text' => fake()->randomElement(['map()','filter()','reduce()','forEach()']),
                    'img'  => null,
                    'alt'  => null,
                ])->all(),
            ],
            'validate' => ['mode' => 'mcq', 'correctIndex' => fake()->numberBetween(0, 3)],
        ]);
    }

    /**
     * TRUE/FALSE short.
     */
    public function trueFalse(): static
    {
        return $this->state(function () {
            return [
                'type'       => 'true_false',
                'prompt'     => fake()->randomElement([
                    'The Earth revolves around the Sun.',
                    'CSS stands for Computer Style Sheets.',
                    '0 == "0" is true in JavaScript.',
                ]),
                'payload'    => [], // nothing needed for TF
                'validate'   => ['mode' => 'boolean', 'answer' => fake()->boolean()],
                'background' => fake()->randomElement([
                    'solid:#111827',
                    'grad:linear:#06b6d4,#22d3ee',
                    'grad:radial:#4338ca,#a78bfa',
                ]),
                'time_limit' => 8,
                'tags'       => ['general','tf'],
            ];
        });
    }

    /**
     * ONE WORD short (accepts synonyms).
     */
    public function oneWord(): static
    {
        return $this->state(function () {
            $answer = fake()->randomElement(['photosynthesis','osmosis','evaporation']);
            return [
                'type'       => 'one_word',
                'prompt'     => fake()->randomElement([
                    'Process by which plants make food?',
                    'Movement of solvent through a semipermeable membrane?',
                    'Process of liquid turning into vapor?',
                ]),
                'payload'    => ['placeholder' => 'One word'],
                'validate'   => [
                    'mode'             => 'text',
                    'answers'          => [$answer, str_replace('photo', 'photo ', $answer)], // small variant
                    'caseInsensitive'  => true,
                    'trim'             => true,
                    'collapseSpaces'   => true,
                ],
                'background' => fake()->randomElement([
                    'solid:#0f172a',
                    'grad:linear:#22c55e,#16a34a',
                ]),
                'time_limit' => 12,
                'tags'       => ['bio','terms'],
            ];
        });
    }

    /**
     * CODE OUTPUT short (answer is a brief output string/number).
     */
    public function codeOutput(): static
    {
        return $this->state(function () {
            $cases = [
                [
                    'code'     => "let x = 2; console.log(x**3);",
                    'answers'  => ['8','8\n','8\r\n'],
                    'language' => 'js',
                    'prompt'   => 'What is the output?',
                ],
                [
                    'code'     => "print(sum([1, 2, 3]))",
                    'answers'  => ['6','6\n'],
                    'language' => 'py',
                    'prompt'   => 'What does this print?',
                ],
            ];
            $pick = fake()->randomElement($cases);

            return [
                'type'       => 'code_output',
                'prompt'     => $pick['prompt'],
                'payload'    => ['code' => $pick['code'], 'language' => $pick['language']],
                'validate'   => ['mode' => 'text', 'answers' => $pick['answers'], 'caseInsensitive' => true, 'trim' => true],
                'background' => 'solid:#0b1020',
                'time_limit' => 12,
                'tags'       => ['code','output'],
            ];
        });
    }

    /**
     * ONE NUMBER short (exact or within tolerance).
     */
    public function oneNumber(): static
    {
        return $this->state(function () {
            $pi2 = 3.14;
            return [
                'type'       => 'one_number',
                'prompt'     => fake()->randomElement([
                    'Value of π to 2 decimals?',
                    'What is 10 / 4 rounded to 2 decimals?',
                ]),
                'payload'    => ['unit' => null, 'placeholder' => 'Enter number'],
                'validate'   => ['mode' => 'numeric', 'exact' => $pi2, 'tolerance' => 0.005],
                'background' => 'grad:linear:#f59e0b,#ef4444',
                'time_limit' => 10,
                'tags'       => ['math','numeric'],
            ];
        });
    }

    /* ---------- Optional convenience scopes ---------- */

    public function forCourse(Course $course): static
    {
        return $this->state(fn (array $a) => ['course_id' => $course->id]);
    }

    public function byUser(User $user): static
    {
        return $this->state(fn (array $a) => ['creator_id' => $user->id]);
    }
}
