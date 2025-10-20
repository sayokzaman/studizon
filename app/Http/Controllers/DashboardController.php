<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {

        // today's classes where user is a teacher
        $myClassesToday = Classroom::where('teacher_id', Auth::id())
            ->whereDate('starts_at', today())
            ->get();

        $tz = 'Asia/Dhaka';
        $weekStartsOn = Carbon::MONDAY;

        $start = now($tz)->startOfWeek($weekStartsOn);
        $end = now($tz)->endOfWeek($weekStartsOn);

        $rawCounts = Classroom::query()
            ->where('teacher_id', Auth::user()->id)
            ->whereBetween('scheduled_date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('scheduled_date, COUNT(*) as total')
            ->groupBy('scheduled_date')
            ->pluck('total', 'scheduled_date');

        $period = CarbonPeriod::create($start, $end);

        $countsByDay = collect(iterator_to_array($period))
            ->map(function (Carbon $d) use ($rawCounts) {
                return [
                    'date' => $d->toDateString(),
                    'total' => (int) ($rawCounts[$d->toDateString()] ?? 0),
                ];
            })
            ->values()
            ->all();

        $joinedClassesToday = Classroom::query()
            ->with('teacher', 'course')
            ->whereDate('scheduled_date', Carbon::today($tz))
            ->whereHas('students', function ($q) {
                $q->where('users.id', Auth::user()->id)        // you are in the classroom
                    ->where('classroom_user.role', 'student'); // as a student
            })
            ->orderBy('starts_at') // optional sort
            ->get();

        return inertia('dashboard', [
            'joinedClassesToday' => $joinedClassesToday,
            'myClassesToday' => $myClassesToday,
            'classesPerDay' => $countsByDay,
        ]);
    }
}
