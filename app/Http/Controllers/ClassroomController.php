<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\ClassroomAttachment;
use App\Models\Notification;
use App\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Classroom::query()
            ->with(['course', 'teacher', 'students'])
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('topic', 'like', "%{$request->search}%")
                        ->orWhereHas('course', function ($query) use ($request) {
                            $query->where('name', 'like', "%{$request->search}%")
                                ->orWhere('code', 'like', "%{$request->search}%");
                        });
                });
            })
            ->when($request->filled('course_ids'), function ($q) use ($request) {
                $ids = array_filter((array) $request->input('course_ids'));
                if (! empty($ids)) {
                    $q->whereIn('course_id', $ids);
                }
            })
            ->when($request->filled('scheduled_date') && ($request->filled('starts_at') || $request->filled('ends_at')), function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->whereDate('scheduled_date', $request->scheduled_date)
                        ->when($request->filled('starts_at'), function ($q) use ($request) {
                            $q->whereTime('starts_at', '>=', $request->starts_at);
                        })
                        ->when($request->filled('ends_at'), function ($q) use ($request) {
                            $q->whereTime('ends_at', '<=', $request->ends_at);
                        });
                });
            })
            ->when($request->filled('scheduled_date') && ! ($request->filled('starts_at') || $request->filled('ends_at')), function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->whereDate('scheduled_date', $request->scheduled_date);
                });
            });

        $exploreQuery = clone $query;
        $myQuery = clone $query;
        $joinedQuery = clone $query;

        $exploreQuery->where('teacher_id', '!=', $user->id);
        $myQuery->where('teacher_id', $user->id);
        $joinedQuery->whereHas('students', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });

        // Sorting: support UI options (scheduled_date, created_at, credits, capacity, rating, starts_at, ends_at)
        // Default to latest classes first
        $sortBy = (string) $request->input('sort_by', 'created_at');
        $sortDir = strtolower((string) $request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        // Map UI value -> actual column
        $columnMap = [
            'scheduled_date' => 'scheduled_date',
            'created_at' => 'created_at',
            'credits' => 'cost', // credits in UI maps to cost in DB
            'capacity' => 'capacity',
            'starts_at' => 'starts_at',
            'ends_at' => 'ends_at',
            'rating' => 'rating',
            // 'rating' has no backing column; fallback handled below
        ];
        $column = $columnMap[$sortBy] ?? 'scheduled_date';

        $applySorting = function ($q) use ($column, $sortDir) {
            // Primary sort by selected column and direction
            if ($column !== 'rating') {
                $q->orderBy($column, $sortDir);
            } else {
                // find the avg rating of the classroom teacher from teacher->ratings
                $ratingSub = DB::table('ratings')
                    ->select('user_id', DB::raw('AVG(rating) as teacher_avg_rating'))
                    ->groupBy('user_id');

                $q->leftJoinSub($ratingSub, 'teacher_ratings', function ($join) {
                    $join->on('teacher_ratings.user_id', '=', 'classrooms.teacher_id');
                })
                    ->select('classrooms.*')
                    ->orderByRaw('COALESCE(teacher_ratings.teacher_avg_rating, 0) '.($sortDir === 'desc' ? 'DESC' : 'ASC'));
            }
            // Secondary ordering for deterministic listing
            if ($column !== 'scheduled_date') {
                $q->orderByDesc('scheduled_date');
            }
            if ($column !== 'starts_at') {
                $q->orderBy('starts_at');
            }
        };

        $applySorting($exploreQuery);
        $applySorting($myQuery);
        $applySorting($joinedQuery);

        // Explore is paginated; My/Joined are arrays (UI expects arrays)
        $classrooms = $exploreQuery
            ->paginate((int) ($request->per_page ?? 20))
            ->withQueryString();

        $myClasses = $myQuery
            ->paginate((int) ($request->per_page ?? 20))
            ->withQueryString();

        $joinedClasses = $joinedQuery
            ->paginate((int) ($request->per_page ?? 20))
            ->withQueryString();

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
                'sort_by' => (string) $request->input('sort_by', ''),
                'sort_dir' => (string) $request->input('sort_dir', ''),
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

        $fromEnd = Auth::user()->id !== $classroom->teacher_id && request()->query('from') === 'end_class' ? true : false;

        return inertia('classroom/show', [
            'classroom' => $classroom->load('students.program', 'teacher', 'course.program', 'classroomAttachments'),
            'openRatingModal' => $fromEnd,
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

        // Store attachments (notes) if any were uploaded
        if ($request->hasFile('notes')) {
            foreach ((array) $request->file('notes') as $file) {
                if (! $file) {
                    continue;
                }
                $storedPath = $file->store('classroom_attachments', 'public');
                ClassroomAttachment::create([
                    'classroom_id' => $classRoom->id,
                    'path' => $storedPath,
                    'type' => (string) $file->getClientOriginalExtension(),
                    'name' => (string) $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('classroom.show', $classRoom)->with([
            'success' => true,
            'message' => 'Classroom created successfully',
            'classroom' => $classRoom,
            // ->load('notes'),
        ], 201);
    }

    public function cancel(Classroom $classroom)
    {
        $classroom->update([
            'status' => 'cancelled',
        ]);

        // create a notification for every student
        $classroom->students()->each(function ($student) use ($classroom) {
            Notification::create([
                'user_id' => $student->id,
                'type' => NotificationType::CLASSROOM_CANCELLED,
                'classroom_id' => $classroom->id,
            ]);
        });

        return redirect()->route('classroom.show', $classroom)->with([
            'success' => true,
            'message' => 'Classroom cancelled successfully',
        ], 201);
    }

    public function join(Request $request, Classroom $classroom)
    {
        $user = $request->user();

        // 1. Check if already joined
        if ($classroom->students()->where('user_id', $user->id)->exists()) {
            return redirect()->route('classroom.show', $classroom)->with([
                'success' => false,
                'message' => 'You have already joined this class.',
            ]);
        }

        // 2. Check capacity
        if ($classroom->students()->count() >= $classroom->capacity) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'This class is full.',
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
            return back()->with([
                'success' => false,
                'message' => 'You do not have enough credits to join this class.',
            ]);
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
                ->with(['message', 'You cannot join your own class.', 'success' => false]);
        }

        // Reuse the same join logic (optionally refactor to private method)
        if ($classroom->students()->where('user_id', $user->id)->exists()) {
            return redirect()->route('classroom.show', $classroom)
                ->with(['message', 'You have already joined this class.', 'success' => false]);
        }

        if ($classroom->students()->count() >= $classroom->capacity) {
            return redirect()->route('classroom.show', $classroom)
                ->with(['message', 'This class is full.', 'success' => false]);
        }

        if ($user->credits < $classroom->cost) {
            return redirect()->route('classroom.show', $classroom)
                ->with(['message', 'You do not have enough credits to join this class.', 'success' => false]);
        }

        $user->deductCredits($classroom->cost);
        $classroom->students()->attach($user->id);

        return redirect()->route('classroom.show', $classroom)
            ->with(['message', 'You have joined the class!', 'success' => true]);
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
