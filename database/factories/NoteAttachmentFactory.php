<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NoteAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Http\UploadedFile;

class NoteAttachmentFactory extends Factory
{
    protected $model = NoteAttachment::class;

    public function definition()
    {
        return [
            'note_id' => Note::factory(),
            'file_path' => 'note_attachments/' . $this->faker->uuid() . '.pdf',
            'file_name' => $this->faker->word() . '.' . $this->faker->fileExtension(),
            'file_type' => $this->faker->mimeType(),
            'file_size' => $this->faker->numberBetween(1000, 5000000), // 1KB to 5MB
        ];
    }
}