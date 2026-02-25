<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ToolController;
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

    // Tools CRUD
    Route::apiResource('api/tools', ToolController::class);

    // Categories
    Route::get('api/categories',  [CategoryController::class, 'index']);
    Route::post('api/categories', [CategoryController::class, 'store']);

    // Tags
    Route::get('api/tags',  [TagController::class, 'index']);
    Route::post('api/tags', [TagController::class, 'store']);
});
