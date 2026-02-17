<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    private const DICEBEAR_STYLES = [
        'adventurer',
        'adventurer-neutral',
        'avataaars',
        'avataaars-neutral',
        'big-ears',
        'big-ears-neutral',
        'big-smile',
        'bottts',
        'bottts-neutral',
        'croodles',
        'croodles-neutral',
        'dylan',
        'fun-emoji',
        'glass',
        'icons',
        'identicon',
        'initials',
        'lorelei',
        'lorelei-neutral',
        'micah',
        'miniavs',
        'notionists',
        'notionists-neutral',
        'open-peeps',
        'personas',
        'pixel-art',
        'pixel-art-neutral',
        'rings',
        'shapes',
        'thumbs',
        'toon-head',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Program::query()
            ->select('id')
            ->each(function (Program $program): void {
                $courses = Course::query()
                    ->where('program_id', $program->id)
                    ->get();

                if ($courses->isEmpty()) {
                    return;
                }

                $users = User::factory(10)->create([
                    'program_id' => Program::inRandomOrder()->first()->id,
                    'credits' => 500,
                    'profile_completed' => true,
                ]);

                $users->each(function (User $user) use ($courses): void {
                    $user->update([
                        'profile_picture' => $this->getDiceBearAvatarUrl($user),
                    ]);

                    $user->courses()->attach(
                        $courses->random(min(3, $courses->count()))->pluck('id')->toArray()
                    );
                });
            });
    }

    private function getDiceBearAvatarUrl(User $user): string
    {
        $seed = rawurlencode($user->email ?? (string) $user->id);
        $style = fake()->randomElement(self::DICEBEAR_STYLES);

        return "https://api.dicebear.com/9.x/{$style}/svg?seed={$seed}";
    }
}
