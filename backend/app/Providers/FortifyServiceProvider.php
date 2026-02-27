<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorChallengeViewResponse as TwoFactorChallengeViewResponseContract;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Force JSON responses for all Fortify login endpoints.
        // Next.js proxies don't always preserve Accept: application/json,
        // so Fortify would otherwise return 302 redirects instead of JSON.

        $this->app->instance(LoginResponseContract::class, new class implements LoginResponseContract {
            public function toResponse($request)
            {
                return response()->json(['two_factor' => false]);
            }
        });

        $this->app->instance(TwoFactorLoginResponseContract::class, new class implements TwoFactorLoginResponseContract {
            public function toResponse($request)
            {
                return response()->json(['two_factor' => true]);
            }
        });

        $this->app->instance(TwoFactorChallengeViewResponseContract::class, new class implements TwoFactorChallengeViewResponseContract {
            public function toResponse($request)
            {
                return response()->json(['two_factor' => true]);
            }
        });
    }

    public function boot(): void
    {
        // Custom user authentication
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            if ($user && password_verify($request->password, $user->password)) {
                return $user;
            }

            return null;
        });

        // Rate limiter for login
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = strtolower($request->input(Fortify::username())).'|'.$request->ip();
            return Limit::perMinute(5)->by($throttleKey);
        });

        // Rate limiter for 2FA
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->getId());
        });
    }
}
