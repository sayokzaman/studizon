<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassroomController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $classrooms = Classroom::where('status', 'scheduled')
            ->whereIn('course_id', $user->courses->pluck('id'))
            ->whereDoesntHave('students', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('start_time', 'desc')
            ->orderBy('created_at', 'desc')
            ->with('course', 'teacher', 'students')
            ->get()->take(5);

        $myClasses = Classroom::where('teacher_id', $user->id)
            ->orderBy('start_time')
            ->with('course', 'teacher', 'students')
            ->get();

        return inertia('classroom/index', [
            'classrooms' => $classrooms,
            'myClasses' => $myClasses,
            'joinedClasses' => $user->joinedClassrooms->load('course', 'teacher', 'students'),
        ]);
    }

    public function create()
    {
        return inertia('classroom/create');
    }

    public function show(Classroom $classroom)
    {
        $user = Auth::user();

        // Prevent unauthorized access
        abort_unless($classroom->students->contains($user->id) || $user->id === $classroom->teacher_id, 403);

        return inertia('classroom/show', [
            'classroom' => $classroom->load('students.program', 'teacher', 'course.program'),
        ]);
    }

    public function store(Request $request)
    {
        // ✅ 1. Validate incoming data
        $validated = $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'topic' => 'required|string|max:255',
            'cost' => 'required|integer|min:0',
            'capacity' => 'required|integer|min:1',
            'join_link' => 'required|url',
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
            'join_link' => $validated['join_link'],
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
        return redirect()->route('classroom.show', $classRoom)->with([
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
            return redirect()->route('classroom.show', $classroom)->with([
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
        if ($user->credits >= $classroom->cost) {
            $user->deductCredits($classroom->cost);
            $classroom->students()->attach($user->id);
        } else {
            return back()->withErrors(['Not enough credits to join.']);
        }

        // 5. Deduct currency if needed
        // $user->decrement('credits', $classroom->cost);

        return redirect(route('classroom.show', $classroom))->with([
            'message' => 'You have joined the class!',
            'success' => true,
            'classroom' => $classroom->fresh('students'), // Return updated classroom data
        ], 200);
    }

    public function joinViaLink(Request $request, Classroom $classroom)
    {
        $user = $request->user();

        if (! $user) {
            // if not logged in, redirect to login with intended link
            return redirect()->route('login')->with('redirect_to', route('classroom.join.link', $classroom));
        }

        if ($classroom->teacher_id === $user->id) {
            return redirect()->route('classroom.show', $classroom)
                ->with('message', 'You cannot join your own class.');
        }

        // Reuse the same join logic (optionally refactor to private method)
        if ($classroom->students()->where('user_id', $user->id)->exists()) {
            return redirect()->route('classroom.show', $classroom)
                ->with('message', 'You have already joined this class.');
        }

        if ($classroom->students()->count() >= $classroom->capacity) {
            return redirect()->route('classroom.show', $classroom)
                ->withErrors(['This class is full.']);
        }

        if ($user->credits < $classroom->cost) {
            return redirect()->route('classroom.show', $classroom)
                ->withErrors(['Not enough credits to join.']);
        }

        $user->deductCredits($classroom->cost);
        $classroom->students()->attach($user->id);

        return redirect()->route('classroom.show', $classroom)
            ->with('message', 'You have joined the class!');
    }

    public function leaveClass(Request $request, Classroom $classroom)
    {
        $user = $request->user();

        // 1️⃣ Check if the user is actually enrolled
        if (! $classroom->students()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with([
                'message' => 'You are not enrolled in this class.',
                'success' => false,
            ]);
        }

        // 2️⃣ Detach the user from the classroom
        $classroom->students()->detach($user->id);

        // 3️⃣ (Optional) Refund partial or full cost
        // Example: refund 100% if the class hasn't started yet
        if (now()->lt($classroom->scheduled_date)) {
            $user->increment('credits', $classroom->cost);
        }

        // 4️⃣ Redirect or respond
        return redirect()->route('classroom.index')->with([
            'message' => 'You have successfully left the class.',
            'success' => true,
        ]);
    }
}
