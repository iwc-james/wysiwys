<?php

use Illuminate\Auth\GenericUser;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->actingAs(new GenericUser(['id' => 1]));
});

it('refuse les invités', function () {
    auth()->forgetGuards();

    $this->getJson(route('wysiwys.images.index'))->assertUnauthorized();
    $this->postJson(route('wysiwys.images.store'))->assertUnauthorized();
    $this->deleteJson(route('wysiwys.images.destroy', 'a.png'))->assertUnauthorized();
});

it('enregistre une image directement dans public/storage/wysiwys', function () {
    $response = $this->postJson(route('wysiwys.images.store'), [
        'image' => UploadedFile::fake()->image('Ma Photo.JPG', 20, 20),
    ]);

    $response->assertCreated()->assertJson([
        'name' => 'ma-photo.jpg',
        'url' => url('storage/wysiwys/ma-photo.jpg'),
    ]);

    expect(public_path('storage/wysiwys/ma-photo.jpg'))->toBeFile();
});

it('ne remplace pas une image existante', function () {
    $this->postJson(route('wysiwys.images.store'), ['image' => UploadedFile::fake()->image('photo.png')]);
    $this->postJson(route('wysiwys.images.store'), ['image' => UploadedFile::fake()->image('photo.png')])
        ->assertJson(['name' => 'photo-1.png']);
});

it('respecte le dossier configuré', function () {
    config(['wysiwys.directory' => '/uploads/editor/']);

    $this->postJson(route('wysiwys.images.store'), ['image' => UploadedFile::fake()->image('a.png')])
        ->assertJson(['url' => url('uploads/editor/a.png')]);

    expect(public_path('uploads/editor/a.png'))->toBeFile();
});

it('refuse les fichiers non image', function (UploadedFile $file) {
    $this->postJson(route('wysiwys.images.store'), ['image' => $file])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('image');
})->with([
    'php' => fn () => UploadedFile::fake()->create('shell.php', 1, 'application/x-php'),
    'svg' => fn () => UploadedFile::fake()->create('logo.svg', 1, 'image/svg+xml'),
    'pdf' => fn () => UploadedFile::fake()->create('doc.pdf', 1, 'application/pdf'),
]);

it('refuse les images trop lourdes', function () {
    config(['wysiwys.max_size' => 10]);

    $this->postJson(route('wysiwys.images.store'), ['image' => UploadedFile::fake()->image('big.jpg')->size(50)])
        ->assertUnprocessable();
});

it('liste les images du serveur, les plus récentes d’abord', function () {
    expect($this->getJson(route('wysiwys.images.index'))->json('images'))->toBe([]);

    $dir = public_path('storage/wysiwys');
    mkdir($dir, 0777, true);
    file_put_contents($dir.'/ancienne.png', 'x');
    touch($dir.'/ancienne.png', time() - 100);
    file_put_contents($dir.'/recente.webp', 'x');
    file_put_contents($dir.'/notes.txt', 'x');

    $images = $this->getJson(route('wysiwys.images.index'))->assertOk()->json('images');

    expect(array_column($images, 'name'))->toBe(['recente.webp', 'ancienne.png'])
        ->and($images[0]['url'])->toBe(url('storage/wysiwys/recente.webp'));
});

it('supprime une image du serveur', function () {
    $this->postJson(route('wysiwys.images.store'), ['image' => UploadedFile::fake()->image('photo.png')]);

    $this->deleteJson(route('wysiwys.images.destroy', 'photo.png'))->assertNoContent();

    expect(public_path('storage/wysiwys/photo.png'))->not->toBeFile();
});

it('renvoie 404 pour une image inconnue', function () {
    $this->deleteJson(route('wysiwys.images.destroy', 'absente.png'))->assertNotFound();
});

it('refuse de supprimer hors du dossier ou un fichier non image', function (string $name) {
    $dir = public_path('storage/wysiwys');
    @mkdir($dir, 0777, true);
    file_put_contents($dir.'/notes.txt', 'x');
    file_put_contents($dir.'/.htaccess.png', 'x');
    file_put_contents(public_path('secret.png'), 'x');

    $this->delete(url('wysiwys/images/'.$name), [], ['Accept' => 'application/json'])->assertNotFound();

    expect($dir.'/notes.txt')->toBeFile()
        ->and($dir.'/.htaccess.png')->toBeFile()
        ->and(public_path('secret.png'))->toBeFile();
})->with([
    'non image' => 'notes.txt',
    'fichier caché' => '.htaccess.png',
    'remontée' => '..%2Fsecret.png',
    'remontée antislash' => '..%5Csecret.png',
]);
