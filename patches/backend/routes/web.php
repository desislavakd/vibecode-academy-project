<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| SPA Auth Routes — session-based, no Sanctum stateful detection needed
|--------------------------------------------------------------------------
| These routes sit in the web group so the session middleware always runs.
| GET requests are never subject to CSRF verification.
*/

Route::middleware('auth')->group(function () {

    /**
     * GET /api/me
     * Returns the currently authenticated user.
     * Called by the Next.js frontend to verify / load the logged-in user.
     */
    Route::get('/api/me', function (Request $request) {
        $user = $request->user();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role->value,
        ]);
    });
});
