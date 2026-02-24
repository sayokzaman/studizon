<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $request->validateCredentials();

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();
        $request->session()->forget('guest_mode');

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Log in using a temporary shared guest account.
     */
    public function guest(Request $request): RedirectResponse
    {
        $guestUser = User::firstOrCreate(
            ['email' => 'guest@studizon.local'],
            [
                'name' => 'Guest User',
                'password' => Str::password(32),
                'profile_completed' => true,
                'credits' => 0,
            ],
        );

        if (! $guestUser->profile_completed || is_null($guestUser->email_verified_at)) {
            $guestUser->forceFill([
                'profile_completed' => true,
                'email_verified_at' => CarbonImmutable::now(),
            ])->save();
        }

        Auth::login($guestUser, false);

        $request->session()->regenerate();
        $request->session()->put('guest_mode', true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
