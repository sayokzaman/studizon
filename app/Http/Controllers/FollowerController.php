<?php

namespace App\Http\Controllers;

use App\Models\Follower;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $request->user()
            ->following()
            ->firstOrCreate(['following_id' => $follow->id]);

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
