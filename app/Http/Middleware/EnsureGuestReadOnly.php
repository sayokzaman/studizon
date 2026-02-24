<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuestReadOnly
{
    /**
     * Prevent guest-mode users from mutating application data.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! (bool) $request->session()->get('guest_mode', false)) {
            return $next($request);
        }

        if ($request->isMethodSafe() || $request->routeIs('logout')) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Guest mode is read-only. Sign up to make changes.',
            ], 403);
        }

        return back()->with([
            'success' => false,
            'message' => 'Guest mode is read-only. Sign up to make changes.',
        ]);
    }
}
