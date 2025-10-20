<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class PopulateDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'Department of Computer Science and Engineering' => [
                ['B.Sc. in Computer Science & Engineering', 'CSE'],
                ['B.Sc. in Data Science', 'BSDS'],
                ['M.Sc. in Computer Science & Engineering', 'MSCSE'],
            ],
            'Department of Electrical and Electronics Engineering' => [
                ['B.Sc. in Electrical & Electronics Engineering', 'EEE'],
            ],
            'Department of Civil Engineering' => [
                ['B.Sc. in Civil Engineering', 'CE'],
            ],
            'Department of Business Administration' => [
                ['Bachelor of Business Administration (BBA)', 'BBA'],
                ['BBA in Accounting & Information Systems', 'BBA-AIS'],
                ['Master of Business Administration', 'MBA'],
                ['Executive Master of Business Administration', 'EMBA'],
            ],
            'Department of Economics' => [
                ['Bachelor of Science in Economics', 'BSECO'],
                ['Master of Economics', 'MECO'],
            ],
            'Department of Media Studies and Journalism' => [
                ['BSS in Media Studies and Journalism', 'BSSMSJ'],
            ],
            'Department of Environment and Development Studies' => [
                ['BSS in Environment and Development Studies', 'BSSEDS'],
                ['Master in Development Studies', 'MDS'],
            ],
            'Department of English' => [
                ['BA in English', 'BAENG'],
            ],
            'Department of Pharmacy' => [
                ['B.Pharm', 'BPHARM'],
            ],
            'Department of Biotechnology and Genetic Engineering' => [
                ['B.Sc. in Biotechnology and Genetic Engineering', 'BSBGE'],
            ],
        ];

        foreach ($departments as $deptName => $programs) {
            $department = Department::firstOrCreate(['name' => $deptName]);

            foreach ($programs as [$programName, $code]) {
                $program = Program::firstOrCreate([
                    'department_id' => $department->id,
                    'name' => $programName,
                ], [
                    'code' => $code,
                ]);

                $courseNames = $this->getProgramSpecificCourses($program->code);

                foreach ($courseNames as $index => $courseName) {
                    Course::factory()->create([
                        'program_id' => $program->id,
                        'code' => strtoupper($program->code).'-'.str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'name' => $courseName,
                    ]);
                }

                $courses = Course::all()->where('program_id', $program->id);

                $user = User::factory(10)->create(
                    [
                        'program_id' => Program::inRandomOrder()->first()->id,
                        'credits' => 500,
                        'profile_completed' => true,
                    ]
                );

                $user->each(function ($user) use ($courses) {
                    $user->courses()->attach($courses->random(3)->pluck('id')->toArray());
                });

                foreach ($courses as $course) {
                    // create classrooms for each course
                    Classroom::factory()->count(2)->create([
                        'course_id' => $course->id,
                    ]);
                }
            }
        }
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
