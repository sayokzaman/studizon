<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            ProductionSeeder::class,
            // PopulateDatabaseSeeder::class,
            UserSeeder::class,
            ClassroomSeeder::class,
            ClassroomStudentSeeder::class,
            RatingSeeder::class,
            ShortSeeder::class,
            NoteSeeder::class,
        ]);
    }
}
