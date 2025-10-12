<?php

namespace Database\Seeders;

use App\Models\Short;
use Illuminate\Database\Seeder;

class ShortSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Short::factory()->count(10)->create();                 // mcq
        Short::factory()->count(5)->trueFalse()->create();     // true/false
        Short::factory()->count(5)->oneWord()->create();       // one word
        Short::factory()->count(5)->codeOutput()->create();    // code output
        Short::factory()->count(5)->oneNumber()->create();     // one number
    }
}
