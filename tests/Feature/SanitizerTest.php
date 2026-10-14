<?php

use IwcJames\Wysiwys\Sanitizer;

it('garde le HTML produit par l’éditeur', function () {
    $html = '<h2>Titre</h2><p style="text-align: center;"><strong>gras</strong> <em>ital</em> '
        .'<span style="color: rgb(220, 38, 38);">rouge</span></p><ul><li>un</li></ul><hr>'
        .'<p style="margin-left: 4em;"><a href="https://exemple.fr" target="_blank" rel="noopener noreferrer">lien</a></p>'
        .'<img src="/storage/wysiwys/a.png" alt="A">';

    expect(Sanitizer::clean($html))->toBe($html);
});

it('retire le contenu dangereux', function (string $dirty, string $expected) {
    expect(Sanitizer::clean($dirty))->toBe($expected);
})->with([
    'script' => ['<p>a<script>alert(1)</script></p>', '<p>a</p>'],
    'onclick' => ['<p onclick="x()">a</p>', '<p>a</p>'],
    'javascript:' => ['<a href="java&#9;script:alert(1)">a</a>', '<a>a</a>'],
    'img onerror' => ['<img src="x.png" onerror="x()">', '<img src="x.png">'],
    'img data:' => ['<img src="data:image/png;base64,AAA">', ''],
    'style url' => ['<p style="background:url(x); color: red">a</p>', '<p style="color: red;">a</p>'],
    'balise inconnue' => ['<section><p>a</p></section>', '<p>a</p>'],
    'iframe' => ['<iframe src="https://x"></iframe><p>b</p>', '<p>b</p>'],
    'commentaire' => ['<!-- x --><p>a</p>', '<p>a</p>'],
]);

it('gère les accents et le vide', function () {
    expect(Sanitizer::clean('<p>Été à Noël</p>'))->toBe('<p>Été à Noël</p>')
        ->and(Sanitizer::clean(null))->toBe('')
        ->and(Sanitizer::clean('   '))->toBe('');
});
