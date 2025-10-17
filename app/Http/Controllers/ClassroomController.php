<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        // Do not auto-set scheduled_date; time-only filters should act on time component only.

        $query = Classroom::query()
            ->with(['course', 'teacher', 'students'])
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('topic', 'like', "%{$request->search}%")
                        ->orWhereHas('course', function ($query) use ($request) {
                            $query->where('name', 'like', "%{$request->search}%");
                        });
                });
            })
            ->when($request->filled('course_ids'), function ($q) use ($request) {
                $ids = array_filter((array) $request->input('course_ids'));
                if (! empty($ids)) {
                    $q->whereIn('course_id', $ids);
                }
            })
            // Independent filters: scheduled_date, starts_at (>=), ends_at (<=)
            ->when($request->filled('scheduled_date') && $request->filled('starts_at'), function ($q) use ($request) {
                $scheduledDate = $request->input('scheduled_date');
                $startsAtInput = trim((string) $request->input('starts_at'));

                // Match scheduled_date first
                $q->whereDate('scheduled_date', $scheduledDate);

                // Detect time-only format (e.g. "22:00" or "22:00:00")
                if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $startsAtInput)) {
                    if (strlen($startsAtInput) === 5) {
                        $startsAtInput .= ':00';
                    }

                    // Combine with scheduled date and convert to UTC (DB stores UTC)
                    $local = Carbon::createFromFormat('Y-m-d H:i:s', "$scheduledDate $startsAtInput", config('app.timezone'));
                    $utc = $local->clone()->setTimezone('UTC')->toDateTimeString();

                    // Use full datetime comparison instead of whereTime (fixes timezone issue)
                    return $q->where('starts_at', '>=', $utc);
                }

                // Detect full datetime input (e.g. "2025-10-18 22:00" or with seconds)
                if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/', $startsAtInput)) {
                    if (strlen($startsAtInput) === 16) {
                        $startsAtInput .= ':00';
                    }

                    $local = Carbon::createFromFormat('Y-m-d H:i:s', $startsAtInput, config('app.timezone'));
                    $utc = $local->clone()->setTimezone('UTC')->toDateTimeString();

                    return $q->where('starts_at', '>=', $utc);
                }

                return $q;
            })
            ->when(! $request->filled('scheduled_date') && $request->filled('starts_at'), function ($q) use ($request) {
                // No scheduled_date — assume today in app timezone
                $scheduledDate = now(config('app.timezone'))->toDateString();
                $q->whereDate('scheduled_date', $scheduledDate);

                $startsAtInput = trim((string) $request->input('starts_at'));

                if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $startsAtInput)) {
                    if (strlen($startsAtInput) === 5) {
                        $startsAtInput .= ':00';
                    }

                    $local = Carbon::createFromFormat('Y-m-d H:i:s', "$scheduledDate $startsAtInput", config('app.timezone'));
                    $utc = $local->clone()->setTimezone('UTC')->toDateTimeString();

                    return $q->where('starts_at', '>=', $utc);
                }

                if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/', $startsAtInput)) {
                    if (strlen($startsAtInput) === 16) {
                        $startsAtInput .= ':00';
                    }

                    $local = Carbon::createFromFormat('Y-m-d H:i:s', $startsAtInput, config('app.timezone'));
                    $utc = $local->clone()->setTimezone('UTC')->toDateTimeString();

                    return $q->where('starts_at', '>=', $utc);
                }

                return $q;
            })
            ->when($request->filled('ends_at'), function ($q) use ($request) {
                $endsAt = (string) $request->input('ends_at');
                // Time-only
                if (preg_match('/^\d{2}:\d{2}(?::\d{2})?$/', $endsAt)) {
                    if (strlen($endsAt) === 5) {
                        $endsAt .= ':00';
                    }

                    return $q->whereTime('ends_at', '<=', $endsAt);
                }
                // Datetime
                if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/', $endsAt)) {
                    if (strlen($endsAt) === 16) {
                        $endsAt .= ':00';
                    }

                    return $q->where('ends_at', '<=', $endsAt);
                }
            });

        $classrooms = $query->orderByDesc('scheduled_date')
            ->orderBy('starts_at')
            ->paginate((int) ($request->per_page ?? 20))
            ->withQueryString();

        $user = $request->user();
        $myClasses = $user
            ? Classroom::with(['course', 'teacher', 'students'])
                ->where('teacher_id', $user->id)
                ->orderBy('scheduled_date')
                ->orderBy('starts_at')
                ->get()
            : collect();

        $joinedClasses = $user
            ? $user->joinedClassrooms()->with(['course', 'teacher', 'students'])->get()
            : collect();

        return inertia('classroom/index', [
            'classrooms' => $classrooms,
            'myClasses' => $myClasses,
            'joinedClasses' => $joinedClasses,
            'filters' => [
                'search' => (string) $request->input('search', ''),
                'course_ids' => array_values(array_filter((array) $request->input('course_ids', []))),
                'scheduled_date' => (string) $request->input('scheduled_date', ''),
                'starts_at' => (string) $request->input('starts_at', ''),
                'ends_at' => (string) $request->input('ends_at', ''),
                'per_page' => (int) ($request->input('per_page', 20)),
            ],
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
            'join_link' => 'nullable|url',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048', // 2MB
            'scheduled_date' => 'required|date',
            'starts_at' => 'nullable|date_format:Y-m-d H:i:s',
            'ends_at' => 'nullable|date_format:Y-m-d H:i:s',
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s',
            'notes.*' => 'nullable|file|max:10240', // each note max 10MB
        ]);

        // ✅ 2. Store thumbnail if present
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('classroom_thumbnails', 'public');
        }

        // ✅ 3. Create the classroom
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $validated['scheduled_date'].' '.$validated['start_time']);
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $validated['scheduled_date'].' '.$validated['end_time']);
        if ($end->lessThanOrEqualTo($start)) {
            $end->addDay();
        }

        // If explicit starts_at/ends_at were provided, prefer them
        if (! empty($validated['starts_at']) && ! empty($validated['ends_at'])) {
            $start = Carbon::createFromFormat('Y-m-d H:i:s', $validated['starts_at']);
            $end = Carbon::createFromFormat('Y-m-d H:i:s', $validated['ends_at']);
            if ($end->lessThanOrEqualTo($start)) {
                $end->addDay();
            }
        }

        // Normalize scheduled_date to match start date
        $validated['scheduled_date'] = $start->toDateString();

        $classRoom = Classroom::create([
            'course_id' => $validated['course_id'] ?? null,
            'teacher_id' => Auth::user()->id,
            'topic' => $validated['topic'],
            'description' => $validated['description'] ?? null,
            'room_name' => 'cls_'.Str::ulid(),
            'is_live' => false,
            'record' => false,
            'join_link' => $validated['join_link'] ?? null,
            'thumbnail_path' => $thumbnailPath,
            'cost' => $validated['cost'],
            'capacity' => $validated['capacity'],
            'scheduled_date' => $validated['scheduled_date'],
            'starts_at' => $start,
            'ends_at' => $end,
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

    public function live(Classroom $classroom)
    {
        // optional: small guard so direct URL hits get bounced
        // (still keep the real check in token()!)
        return inertia('classroom/live', [
            'classroom' => $classroom->load('students', 'teacher'),
        ]);
    }
}
