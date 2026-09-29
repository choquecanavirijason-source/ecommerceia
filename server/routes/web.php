<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (file_exists(public_path('index.html'))) {
        return response()->file(public_path('index.html'));
    }

    return response()->json([
        'app' => 'UNO COMPRAS API',
        'status' => 'online',
        'version' => '1.0.0',
    ]);
});

// Fallback para SPA / Rutas no encontradas por archivo estático que no sean de /api
Route::fallback(function () {
    if (file_exists(public_path('index.html'))) {
        return response()->file(public_path('index.html'));
    }

    return response()->json(['message' => 'Not Found'], 404);
});