<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassroomAttachment extends Model
{
    protected $table = 'classroom_attachments';

    protected $fillable = [
        'classroom_id',
        'path',
        'type',
        'name',
        'size',
    ];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}
