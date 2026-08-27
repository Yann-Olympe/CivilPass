<?php
return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['https://civil-pass-three.vercel.app'],

    'allowed_origins_patterns' => [
        '#^https://civil-pass-[a-z0-9]+-olympe404\.vercel\.app$#',      // previews par hash (ex: i2g8zv7xx)
        '#^https://civil-pass-git-[a-z0-9\-]+-olympe404\.vercel\.app$#', // previews par branche
    ],


    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];