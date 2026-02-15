<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'admin@email.com',
        ], [
            'name' => 'Admin',
            'password' => Hash::make('password'),
            'credits' => 1000,
            'program_id' => null,
            'profile_completed' => false,
            'email_verified_at' => now(),
        ]);
    }
}
