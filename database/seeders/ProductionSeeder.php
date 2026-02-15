<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = [
            'Department of Computer Science and Engineering' => [
                [
                    'code' => 'CSE',
                    'name' => 'B.Sc. in Computer Science and Engineering',
                    'courses' => [
                        'Structured Programming',
                        'Data Structures',
                        'Algorithms',
                        'Database Systems',
                        'Operating Systems',
                    ],
                ],
                [
                    'code' => 'MSCSE',
                    'name' => 'M.Sc. in Computer Science and Engineering',
                    'courses' => [
                        'Advanced Algorithms',
                        'Machine Learning',
                        'Distributed Systems',
                        'Research Methodology',
                        'Advanced Database Systems',
                    ],
                ],
            ],
            'Department of Electrical and Electronics Engineering' => [
                [
                    'code' => 'EEE',
                    'name' => 'B.Sc. in Electrical and Electronics Engineering',
                    'courses' => [
                        'Circuit Analysis',
                        'Digital Logic Design',
                        'Electromagnetics',
                        'Power Systems',
                        'Control Systems',
                    ],
                ],
                [
                    'code' => 'MSEEE',
                    'name' => 'M.Sc. in Electrical and Electronics Engineering',
                    'courses' => [
                        'Advanced Power Electronics',
                        'Renewable Energy Systems',
                        'Smart Grid Technologies',
                        'Advanced Control Engineering',
                        'Electrical Machine Design',
                    ],
                ],
            ],
            'Department of Business Administration' => [
                [
                    'code' => 'BBA',
                    'name' => 'Bachelor of Business Administration',
                    'courses' => [
                        'Principles of Management',
                        'Financial Accounting',
                        'Marketing Management',
                        'Business Communication',
                        'Organizational Behavior',
                    ],
                ],
                [
                    'code' => 'MBA',
                    'name' => 'Master of Business Administration',
                    'courses' => [
                        'Strategic Management',
                        'Managerial Economics',
                        'Corporate Finance',
                        'Operations Management',
                        'Business Analytics',
                    ],
                ],
            ],
        ];

        foreach ($catalog as $departmentName => $programs) {
            $department = Department::updateOrCreate(
                ['name' => $departmentName],
                ['name' => $departmentName]
            );

            foreach ($programs as $programData) {
                $program = Program::updateOrCreate(
                    [
                        'department_id' => $department->id,
                        'code' => $programData['code'],
                    ],
                    ['name' => $programData['name']]
                );

                foreach ($programData['courses'] as $index => $courseName) {
                    $courseCode = sprintf('%s-%03d', $programData['code'], $index + 101);

                    Course::updateOrCreate(
                        [
                            'program_id' => $program->id,
                            'code' => $courseCode,
                        ],
                        ['name' => $courseName]
                    );
                }
            }
        }
    }
}
