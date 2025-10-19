<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()->notifications()->get();
        $notifications->load('follower');

        return response()->json([
            'notifications' => $notifications,
        ]);
    }
}
