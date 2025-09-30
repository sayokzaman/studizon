<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassroomController extends Controller
{
    public function index()
    {
        return inertia('classroom/index', [
            'classrooms' => Classroom::with('course', 'teacher', 'students')->get(),
        ]);
    }

    public function create()
    {
        return inertia('classroom/create');
    }

    public function store(Request $request)
    {
        // ✅ 1. Validate incoming data
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'topic' => 'required|string|max:255',
            'cost' => 'required|integer|min:0',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048', // 2MB
            'scheduled_date' => 'required|date',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s|after:start_time',
            'notes.*' => 'nullable|file|max:10240', // each note max 10MB
        ]);

        // ✅ 2. Store thumbnail if present
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('classroom_thumbnails', 'public');
        }

        // ✅ 3. Create the classroom
        $classRoom = Classroom::create([
            'course_id' => $validated['course_id'] ?? null,
            'teacher_id' => Auth::user()->id,
            'topic' => $validated['topic'],
            'description' => $validated['description'] ?? null,
            'thumbnail_path' => $thumbnailPath,
            'cost' => $validated['cost'],
            'capacity' => $validated['capacity'],
            'scheduled_date' => $validated['scheduled_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            // status defaults to "scheduled" from migration
        ]);

        // ✅ 4. Store notes if any were uploaded
        // if ($request->hasFile('notes')) {
        //     foreach ($request->file('notes') as $note) {
        //         $path = $note->store('classroom_notes', 'public');

        //         ClassRoomNote::create([
        //             'class_room_id' => $classRoom->id,
        //             'uploaded_by'   => auth()->id(),
        //             'title'         => pathinfo($note->getClientOriginalName(), PATHINFO_FILENAME),
        //             'file_path'     => $path,
        //             'file_type'     => $note->getClientOriginalExtension(),
        //             'file_size'     => $note->getSize(), // bytes
        //         ]);
        //     }
        // }

        // ✅ 5. Return response
        return response()->json([
            'message' => 'Classroom created successfully',
            'classroom' => $classRoom,
            // ->load('notes'),
        ], 201);
    }

    public function join(Request $request, Classroom $classroom)
    {
        $user = $request->user();

        // 1. Check if already joined
        if ($classroom->students()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with([
                'message' => 'You have already joined this class.',
                'success' => false,
            ]);
        }

        // 2. Check capacity
        if ($classroom->students()->count() >= $classroom->capacity) {
            return redirect()->back()->with([
                'message' => 'This class is full.',
                'success' => false,
            ], 422);
        }

        // 3. Check in-app currency balance if needed
        // Example:
        // if ($user->credits < $classroom->cost) { ... }

        // 4. Attach user
        $classroom->students()->attach($user->id);

        // 5. Deduct currency if needed
        // $user->decrement('credits', $classroom->cost);

        return redirect()->back()->with([
            'message' => 'You have joined the class!',
            'success' => true,
            'classroom' => $classroom->fresh('students'), // Return updated classroom data
        ], 200);
    }
}
