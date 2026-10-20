<?php

use Illuminate\Support\Facades\Route;
use IwcJames\Wysiwys\Http\Controllers\AssetController;
use IwcJames\Wysiwys\Http\Controllers\ImageController;

Route::prefix(config('wysiwys.route_prefix', 'wysiwys'))
    ->name('wysiwys.')
    ->group(function () {
        Route::get('assets/{file}', AssetController::class)
            ->where('file', 'wysiwys\.(js|css)')
            ->name('asset');

        Route::middleware(config('wysiwys.middleware', ['web', 'auth']))->group(function () {
            Route::get('images', [ImageController::class, 'index'])->name('images.index');
            Route::post('images', [ImageController::class, 'store'])->name('images.store');
            Route::delete('images/{name}', [ImageController::class, 'destroy'])
                ->where('name', '[^/]+')
                ->name('images.destroy');
        });
    });
