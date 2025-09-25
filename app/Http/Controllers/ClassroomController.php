<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function index()
    {
        return inertia('classroom/index');
    }

    public function create()
    {
        return inertia('classroom/create');
    }
}
