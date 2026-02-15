<?php

use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\LiveClassController;
use App\Http\Controllers\LivekitController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\ShortController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

// Route::get('/classroom/live', function () {
//     return Inertia::render('classroom/live');
// });
// Route::get('/api/livekit/token', [LivekitController::class, 'token']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/setup', [ProfileSetupController::class, 'index'])->name('setup');
    Route::post('/setup', [ProfileSetupController::class, 'store'])->name('setup.store');

    Route::middleware('completed_profile')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('classroom', [ClassroomController::class, 'index'])->name('classroom.index');
        Route::get('classroom/create', [ClassroomController::class, 'create'])->name('classroom.create');
        Route::post('classroom', [ClassroomController::class, 'store'])->name('classroom.store');
        Route::get('classroom/{classroom}', [ClassroomController::class, 'show'])->name('classroom.show');

        Route::get('classroom/{classroom}/join', [ClassroomController::class, 'joinViaLink'])
            ->name('classroom.join.link');
        Route::post('classroom/{classroom}/join', [ClassroomController::class, 'join'])->name('classroom.join');
        Route::post('classroom/{classroom}/leave', [ClassroomController::class, 'leaveClass'])
            ->name('classroom.leave');
        Route::post('classroom/{classroom}/cancel', [ClassroomController::class, 'cancel'])->name('classroom.cancel');

        Route::post('/classrooms/{classroom}/start', [LiveClassController::class, 'start'])->name('classroom.start');
        Route::post('/classrooms/{classroom}/end', [LiveClassController::class, 'end'])->name('classroom.end');
        Route::post('/classrooms/{classroom}/join', [LiveClassController::class, 'join'])
            ->name('classrooms.join');
        Route::get('/classrooms/{classroom}/live', [ClassroomController::class, 'live'])
            ->name('classrooms.live');
        Route::get('/classrooms/{classroom}/token', [LiveClassController::class, 'token'])->name('classroom.token');

        Route::get('/shorts', [ShortController::class, 'index'])->name('shorts.index');
        Route::post('/shorts', [ShortController::class, 'store'])->name('shorts.store');
        Route::post('/shorts/{short}/attempt', [ShortController::class, 'attempt'])->name('shorts.attempt');
        Route::get('/shorts/create', [ShortController::class, 'create'])->name('shorts.create');

        Route::post('/followers/{follow}', [FollowerController::class, 'store'])->name('followers.store');
        Route::delete('/followers/{follow}', [FollowerController::class, 'destroy'])->name('followers.destroy');
        Route::delete('/followers/{follow}', [FollowerController::class, 'destroy'])->name('followers.destroy');

        Route::get('/people', [UserController::class, 'index'])->name('user.index');
        Route::get('/people/{user}', [UserController::class, 'show'])->name('user.show');
        Route::post('/rating', [RatingController::class, 'store'])->name('user.rating');

        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

        Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
        Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

        Route::get('/notes/{note}/download', [NoteController::class, 'download'])
            ->name('notes.download');
        Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');
        Route::get('/notes/create', [NoteController::class, 'create'])->name('notes.create');
        Route::get('/notes/load-more', [NoteController::class, 'loadMore'])->name('notes.loadMore'); // new
        Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
        Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

        Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
        Route::get('/notes/{note}', [NoteController::class, 'show'])->name('notes.show');
    });

    Route::get('get-departments', [DepartmentController::class, 'getDepartments'])->name('getDepartments');
    Route::get('get-programs', [ProgramController::class, 'getPrograms'])->name('getPrograms');
    Route::get('get-courses', [CourseController::class, 'getCourses'])->name('getCourses');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
