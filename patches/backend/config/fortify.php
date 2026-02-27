<?php

use App\Providers\RouteServiceProvider;
use Laravel\Fortify\Features;

return [

    /*
    |--------------------------------------------------------------------------
    | Fortify Guard
    |--------------------------------------------------------------------------
    */
    'guard' => 'web',

    /*
    |--------------------------------------------------------------------------
    | Fortify Password Broker
    |--------------------------------------------------------------------------
    */
    'passwords' => 'users',

    /*
    |--------------------------------------------------------------------------
    | Username / Email
    |--------------------------------------------------------------------------
    */
    'username' => 'email',

    'email' => 'email',

    /*
    |--------------------------------------------------------------------------
    | Home Path
    |--------------------------------------------------------------------------
    | Used for redirects after login. For API-only usage this is irrelevant
    | but required by Fortify.
    */
    'home' => '/dashboard',

    /*
    |--------------------------------------------------------------------------
    | Fortify Routes Prefix / Subdomain
    |--------------------------------------------------------------------------
    */
    'prefix' => 'auth',
    'domain' => null,

    /*
    |--------------------------------------------------------------------------
    | Fortify Routes Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'limiters' => [
        'login'       => 'login',
        'two-factor'  => 'two-factor',
    ],

    /*
    |--------------------------------------------------------------------------
    | Register View Routes
    | Disable since we are serving views from Next.js
    |--------------------------------------------------------------------------
    */
    'views' => false,

    /*
    |--------------------------------------------------------------------------
    | Features
    |--------------------------------------------------------------------------
    */
    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        Features::emailVerification(),
        Features::updateProfileInformation(),
        Features::updatePasswords(),
        Features::twoFactorAuthentication([
            'confirm'         => true,   // requires confirmation code after setup
            'confirmPassword' => false,  // skip password re-entry (no /auth/confirm-password in SPA)
        ]),
    ],

];
