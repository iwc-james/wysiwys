<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use IwcJames\Wysiwys\Sanitizer;

Route::match(['get', 'post'], '/', function (Request $request) {
    $body = $request->isMethod('post')
        ? Sanitizer::clean($request->input('body'))
        : '<h2>Bienvenue</h2><p>Ceci est un <strong>éditeur</strong> <em>très simple</em>.</p>';

    return view('demo', ['body' => $body, 'submitted' => $request->isMethod('post')]);
});
