<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shorts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();

            $table->enum('type', ['mcq',
                'true_false',
                'one_word',
                'code_output',
                'one_number',
                // add more when you support them:
                'fill_blanks', 'sequence', 'rearrange', 'spot_error', ]);
            $table->string('prompt', 500);
            $table->json('payload');   // << unified payload
            $table->json('validate');  // { mode:"mcq", correctIndex:int }

            $table->string('background')->nullable();
            $table->unsignedSmallInteger('time_limit')->default(15);
            $table->unsignedSmallInteger('max_points')->default(1);
            $table->enum('visibility', ['public', 'program_only'])->default('public');
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        Schema::create('short_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('short_id')->constrained('shorts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('answer');         // for MCQ, store the selected index (number)
            $table->boolean('is_correct');
            $table->unsignedSmallInteger('time_taken')->default(0);
            $table->unsignedSmallInteger('points_awarded')->default(0);
            $table->timestamps();
            // $table->unique(['short_id','user_id']); // enable later if you want 1 attempt/user
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('short_attempts');
        Schema::dropIfExists('shorts');
    }
};
