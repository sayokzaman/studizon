<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function getPrograms(Request $request)
    {
        $query = Program::query();

        // Filter by selected department
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        // Filter by search term
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        $programs = $query->take(10)->get();

        return response()->json([
            'programs' => $programs,
        ]);
    }
}
