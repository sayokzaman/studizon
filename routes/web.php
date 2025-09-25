<?php

use App\Http\Controllers\ClassroomController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('classroom', [ClassroomController::class, 'index'])->name('classroom.index');
    Route::get('classroom/create', [ClassroomController::class, 'create'])->name('classroom.create');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
