<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function getCourses(Request $request)
    {
        return response()->json(Course::all());
    }
}
