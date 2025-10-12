<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $fillable = ['name'];

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function students()
    {
        return $this->hasMany(User::class);
    }
}
