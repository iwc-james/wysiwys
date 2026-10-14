<?php

namespace Workbench\App\Providers;

use Illuminate\Support\ServiceProvider;

class WorkbenchServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Démo : pas d'authentification sur les routes d'images.
        config(['wysiwys.middleware' => ['web']]);
    }
}
