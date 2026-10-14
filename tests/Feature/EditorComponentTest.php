<?php

use Illuminate\Support\Facades\Blade;

it('affiche le composant avec sa textarea', function () {
    $html = Blade::render('<x-wysiwys name="body" value="<p>Bonjour</p>" placeholder="Écrire…" :height="400" />');

    expect($html)
        ->toContain('data-wysiwys')
        ->toContain('name="body"')
        ->toContain('&lt;p&gt;Bonjour&lt;/p&gt;')
        ->toContain('data-placeholder="Écrire…"')
        ->toContain('data-height="400"')
        ->toContain(route('wysiwys.images.store'))
        ->toContain('wysiwys/assets/wysiwys.js');
});

it('n’inclut les assets qu’une seule fois par page', function () {
    $html = Blade::render('<x-wysiwys name="a" /><x-wysiwys name="b" />');

    expect(substr_count($html, 'wysiwys.js'))->toBe(1);
});

it('sert le JS et le CSS', function () {
    $this->get(route('wysiwys.asset', 'wysiwys.js'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/javascript; charset=utf-8');

    $this->get(route('wysiwys.asset', 'wysiwys.css'))->assertOk();
    $this->get('/wysiwys/assets/autre.js')->assertNotFound();
});
