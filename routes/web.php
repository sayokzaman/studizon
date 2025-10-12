<?php

use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\ProgramController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/setup', [ProfileSetupController::class, 'index'])->name('setup');
    Route::post('/setup', [ProfileSetupController::class, 'store'])->name('setup.store');

    Route::middleware('completed_profile')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::get('classroom', [ClassroomController::class, 'index'])->name('classroom.index');
        Route::get('classroom/create', [ClassroomController::class, 'create'])->name('classroom.create');
        Route::post('classroom', [ClassroomController::class, 'store'])->name('classroom.store');
        Route::get('classroom/{classroom}', [ClassroomController::class, 'show'])->name('classroom.show');

        Route::get('classroom/{classroom}/join', [ClassroomController::class, 'joinViaLink'])
            ->name('classroom.join.link');
        Route::post('classroom/{classroom}/join', [ClassroomController::class, 'join'])->name('classroom.join');
        Route::post('classroom/{classroom}/leave', [ClassroomController::class, 'leaveClass'])
            ->name('classroom.leave');

    });

    Route::get('get-departments', [DepartmentController::class, 'getDepartments'])->name('getDepartments');
    Route::get('get-programs', [ProgramController::class, 'getPrograms'])->name('getPrograms');
    Route::get('get-courses', [CourseController::class, 'getCourses'])->name('getCourses');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
