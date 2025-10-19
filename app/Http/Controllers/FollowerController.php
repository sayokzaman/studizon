<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FollowerController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->following()->get();
    }

    public function store(Request $request, User $follow)
    {
        // Prevent self-follow
        if ((int) $follow->id === (int) Auth::id()) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'You cannot follow yourself.',
            ]);
        }

        // Attach implicitly via relationship; idempotent
        DB::transaction(function () use ($request, $follow) {
            $request->user()
                ->following()
                ->create(['following_id' => $follow->id]);

            Notification::create([
                'user_id' => $follow->id,
                'type' => NotificationType::FOLLOW,
                'follower_id' => $request->user()->id
            ]);
        });

        return redirect()->back()->with([
            'success' => true,
            'message' => 'You are now following '.$follow->name,
        ]);
    }

    public function destroy(Request $request, User $follow)
    {
        $request->user()->following()->where('following_id', $follow->id)->delete();

        return redirect()->back()->with([
            'success' => true,
            'message' => 'You are no longer following '.$follow->name,
        ]);
    }
}
