<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function getCourses(Request $request)
    {
        $query = Course::query();

        // Filter by selected program
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        // if user wants only courses from their program
        if ($request->input('only_user_program') && Auth::check()) {
            $user = Auth::user();
            if ($user->program_id) {
                $query->where('program_id', $user->program_id);
            }
        }

        // Optional: filter by search term
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        // Limit results if needed
        $courses = $query->take(10)->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }
}
