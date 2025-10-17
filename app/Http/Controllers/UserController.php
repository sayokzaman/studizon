<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return inertia('user/index', [
            'users' => User::all(),
        ]);
    }

    public function show(Request $request, User $user)
    {
        return inertia('user/show', [
            'user' => $user,
        ]);
    }
}
