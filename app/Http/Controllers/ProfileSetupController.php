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
            'profile_picture' => ['nullable', 'image', 'max:2048'], // optional profile picture by me
            'courses.*.id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $user = Auth::user();

        $user->update([
            'program_id' => $validated['program']['id'],
        ]);

        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
        }

        $user->profile_completed = true;
        $user->save();

        $courseIds = collect($validated['courses'])->pluck('id')->all();
        $user->courses()->sync($courseIds);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Profile setup completed successfully!');
    }
}
