<?php

namespace IwcJames\Wysiwys;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use IwcJames\Wysiwys\View\Components\Editor;

class WysiwysServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/wysiwys.php', 'wysiwys');

        $this->app->singleton(ImageLibrary::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'wysiwys');

        Blade::component('wysiwys', Editor::class);

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/wysiwys.php' => config_path('wysiwys.php'),
            ], 'wysiwys-config');

            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/wysiwys'),
            ], 'wysiwys-views');
        }
    }
}
