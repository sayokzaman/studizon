<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileSetupController extends Controller
{
    public function index(Request $request)
    {
        return inertia('setup');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department.id' => ['required', 'integer', 'exists:departments,id'],
            'program.id' => ['required', 'integer', 'exists:programs,id'],
            'courses' => ['required', 'array', 'min:1'],
            'courses.*.id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $user = Auth::user();

        $user->update([
            'program_id' => $validated['program']['id'],
        ]);

        $user->profile_completed = true;
        $user->save();

        $courseIds = collect($validated['courses'])->pluck('id')->all();
        $user->courses()->sync($courseIds);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Profile setup completed successfully!');
    }
}
