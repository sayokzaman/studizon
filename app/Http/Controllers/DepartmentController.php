<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function getDepartments(Request $request)
    {
        $query = Department::query();

        // Search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->input('search').'%');
        }

        // Limit results or paginate if needed
        $departments = $query->take(10)->get();

        // Return as JSON (for frontend fetch)
        return response()->json([
            'departments' => $departments,
        ]);
    }
}
