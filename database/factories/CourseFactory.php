<?php

namespace Database\Factories;

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'code' => $this->faker->unique()->numberBetween(1000, 4999),
            'name' => 'Placeholder', // will be replaced dynamically
        ];
    }

    public function configure()
    {
        return $this->afterMaking(function ($course) {
            $program = Program::find($course->program_id);
            if (! $program) {
                return;
            }

            // Use deterministic course list
            $courseNames = $this->getProgramSpecificCourses($program->code);

            // Faker's randomElement can cause duplicates → we ensure uniqueness manually
            static $usedNames = [];

            // Initialize per-program tracking
            if (! isset($usedNames[$program->id])) {
                $usedNames[$program->id] = [];
            }

            // Pick a name not used for this program yet
            $available = array_diff($courseNames, $usedNames[$program->id]);
            if (empty($available)) {
                // Reset if exhausted
                $usedNames[$program->id] = [];
                $available = $courseNames;
            }

            $selected = $this->faker->randomElement($available);
            $usedNames[$program->id][] = $selected;
            $course->name = $selected;
        });
    }

    private function getProgramSpecificCourses(string $programCode): array
    {
        return match ($programCode) {
            'CSE', 'MSCSE', 'BSDS' => [
                'Programming Fundamentals',
                'Data Structures',
                'Algorithms',
                'Database Systems',
                'Operating Systems',
                'Computer Networks',
                'Artificial Intelligence',
                'Machine Learning',
                'Software Engineering',
                'Web Development',
            ],
            'EEE' => [
                'Circuit Analysis',
                'Electromagnetics',
                'Digital Electronics',
                'Power Systems',
                'Control Systems',
                'Electrical Machines',
                'Microprocessors',
                'Analog Electronics',
            ],
            'CE' => [
                'Structural Engineering',
                'Fluid Mechanics',
                'Geotechnical Engineering',
                'Transportation Engineering',
                'Surveying',
                'Construction Materials',
            ],
            'BBA', 'MBA', 'EMBA', 'BBA-AIS' => [
                'Principles of Management',
                'Financial Accounting',
                'Marketing Fundamentals',
                'Business Communication',
                'Organizational Behavior',
                'Operations Management',
                'Business Ethics',
            ],
            'BSECO', 'MECO' => [
                'Microeconomics',
                'Macroeconomics',
                'Econometrics',
                'Development Economics',
                'International Trade',
            ],
            'BSSMSJ' => [
                'Media Theories',
                'Journalistic Writing',
                'Broadcast Journalism',
                'Public Relations',
                'Digital Media Production',
            ],
            'BSSEDS', 'MDS' => [
                'Environmental Studies',
                'Sustainable Development',
                'Climate Change Policy',
                'Research Methods',
            ],
            'BAENG' => [
                'English Literature',
                'Linguistics',
                'Creative Writing',
                'Literary Criticism',
            ],
            'BPHARM' => [
                'Pharmaceutical Chemistry',
                'Pharmacology',
                'Pharmacognosy',
                'Pharmaceutics',
            ],
            'BSBGE' => [
                'Genetics',
                'Molecular Biology',
                'Biotechnology Principles',
                'Bioinformatics',
            ],
            default => [
                'Introduction to Academic Writing',
                'General Studies',
                'Critical Thinking',
            ],
        };
    }
}
