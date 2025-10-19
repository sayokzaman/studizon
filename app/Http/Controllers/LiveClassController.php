<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Services\LivekitToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LiveClassController extends Controller
{
    // GET /api/classrooms/{classroom}/token
    public function token(Request $req, Classroom $classroom)
    {
        [$ok, $message] = $this->can('join', $classroom, Auth::user());

        if (! $ok) {
            // API endpoint: return JSON 403
            return response()->json(['message' => $message, 'ok' => false], 403);
        }

        $roomName = $classroom->room_name;

        $identity = (string) $req->user()->id;
        $apiKey = env('LIVEKIT_API_KEY', 'devkey');
        $apiSecret = env('LIVEKIT_API_SECRET', 'secret');
        $url = env('LIVEKIT_URL', 'ws://localhost:7880');

        $token = LivekitToken::createToken($apiKey, $apiSecret, $roomName, $identity);

        return response()->json([
            'url' => $url,
            'token' => $token,
            'room' => $roomName,
            'ok' => true,
            'message' => 'Authorized',
        ]);
    }

    public function join(Request $req, Classroom $classroom)
    {
        [$ok, $msg] = $this->can('join', $classroom, $req->user());
        if (! $ok) {
            return back()->with(['success' => false, 'message' => $msg]);
        }

        // ok → go to live page
        return back()->with(['success' => true]);
    }

    // POST /api/classrooms/{classroom}/start
    public function start(Request $req, Classroom $classroom)
    {
        [$ok, $message] = $this->can('start', $classroom, Auth::user());
        if (! $ok) {
            if ($req->expectsJson()) {
                return response()->json(['ok' => false, 'message' => $message], 403);
            }

            return redirect()->back()->with(['message' => $message, 'success' => false]);
        }

        $classroom->update([
            'is_live' => true,
            'status' => 'in_progress',
        ]);

        $success = 'Class started successfully';
        if ($req->expectsJson()) {
            return response()->json(['ok' => true, 'is_live' => true, 'message' => $success]);
        }

        return redirect()->route('classroom.show', $classroom)->with(['message' => $success, 'success' => true]);
    }

    // POST /api/classrooms/{classroom}/end
    public function end(Request $req, Classroom $classroom)
    {
        [$ok, $message] = $this->can('end', $classroom, Auth::user());
        if (! $ok) {
            if ($req->expectsJson()) {
                return response()->json(['ok' => false, 'message' => $message], 403);
            }

            return redirect()->back()->with(['message' => $message, 'success' => false]);
        }

        $classroom->update([
            'is_live' => false,
            'status' => 'completed',
        ]);

        $success = 'Class ended successfully';
        if ($req->expectsJson()) {
            return response()->json(['ok' => true, 'is_live' => false, 'message' => $success]);
        }

        return redirect()->route('classroom.show', ['classroom' => $classroom->id, 'from' => 'end_class'])->with(['message' => $success, 'success' => true]);
    }

    /**
     * Inline authorization helper (avoid naming it "authorize")
     * Returns [bool allowed, string message]
     */
    private function can(string $action, Classroom $classroom, ?\App\Models\User $user): array
    {
        if (! $user) {
            return [false, 'Please sign in.'];
        }

        $isTeacher = $user->id === (int) $classroom->teacher_id;
        $isStudent = $classroom->isStudent($user);

        if ($action === 'start' || $action === 'end') {
            return $isTeacher
                ? [true, 'OK']
                : [false, 'You are not authorized to manage this class.'];
        }

        if ($action === 'join') {
            if ($isTeacher) {
                return [true, 'OK'];
            }
            if ($isStudent && $classroom->is_live) {
                return [true, 'OK'];
            }
            if (! $isStudent) {
                return [false, 'You are not enrolled in this class.'];
            }

            return [false, 'Class is not live yet.'];
        }

        return [false, 'Unauthorized action.'];
    }
}
