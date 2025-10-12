<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no authenticated user yet, let auth middleware handle it
        if (! $user) {
            return $next($request);
        }

        // Check if the user is authenticated and their profile is not completed
        if ($user && ! $user->profile_completed && ! $request->routeIs('setup')) {
            return redirect()->route('setup');
        }

        // Check if the user is authenticated and their profile is completed and they are on the setup page
        if ($user && $user->profile_completed && $request->routeIs('setup')) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
