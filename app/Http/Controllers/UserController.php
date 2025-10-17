<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['program'])
            ->where('id', '!=', Auth::id())
            ->withCount([
                'followers as followers_count',
                'following as following_count',
            ]);

        // Text search (by name or email)
        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            });
        }

        // Filter by courses (users enrolled in any of the given courses)
        $courseIds = array_values(array_filter((array) $request->input('course_ids', [])));
        if (! empty($courseIds)) {
            $query->whereHas('courses', function ($q) use ($courseIds) {
                $q->whereIn('courses.id', $courseIds);
            });
        }

        // following_only: only users the auth user is following
        if ($request->boolean('following_only') && Auth::check()) {
            $authId = Auth::id();
            $query->whereExists(function ($sub) use ($authId) {
                $sub->select(DB::raw(1))
                    ->from('followers')
                    ->whereColumn('followers.following_id', 'users.id')
                    ->where('followers.follower_id', $authId);
            });
        }

        // Sort options
        $sortBy = $request->input('sort_by'); // followers | following | classrooms
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'followers') {
            $query->orderBy('followers_count', $sortDir);
        } elseif ($sortBy === 'following') {
            $query->orderBy('following_count', $sortDir);
        } elseif ($sortBy === 'classrooms') {
            // Count classrooms taught by user with optional status filter
            $status = $request->input('classroom_status');
            $query->select('*')->selectSub(function ($q) use ($status) {
                $q->from('classrooms')
                    ->selectRaw('count(*)')
                    ->whereColumn('classrooms.teacher_id', 'users.id');
                if (! empty($status)) {
                    $q->where('classrooms.status', $status);
                }
            }, 'classrooms_count')
                ->orderBy('classrooms_count', $sortDir);
        } else {
            // Default latest users
            $query->orderByDesc('id');
        }

        $perPage = (int) ($request->input('per_page', 20));
        $users = $query->limit(max(1, $perPage))->get();

        return inertia('user/index', [
            'users' => $users,
            'filters' => [
                'search' => (string) $request->input('search', ''),
                'course_ids' => $courseIds,
                'following_only' => (bool) $request->boolean('following_only'),
                'sort_by' => (string) $request->input('sort_by', ''),
                'sort_dir' => (string) $request->input('sort_dir', 'desc'),
                'classroom_status' => (string) $request->input('classroom_status', ''),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, User $user)
    {
        $user->load('program', 'program.department', 'courses', 'followers', 'following', 'classrooms', 'shorts', 'shorts.creator', 'shorts.course');

        return inertia('user/show', [
            'user' => $user,
        ]);
    }
}
