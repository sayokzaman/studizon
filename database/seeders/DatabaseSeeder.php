<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create(
            [
                'credits' => 500,
                'profile_completed' => true,
            ]
        );

        $this->call([
            AdminSeeder::class,
            PopulateDatabaseSeeder::class,
            ShortSeeder::class,
            NoteSeeder::class,
        ]);
    }
}
