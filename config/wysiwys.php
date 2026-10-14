<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Dossier des images
    |--------------------------------------------------------------------------
    |
    | Chemin relatif au dossier public/ de l'application. Les images y sont
    | écrites directement, elles sont donc accessibles sans storage:link.
    |
    */

    'directory' => env('WYSIWYS_DIRECTORY', 'storage/wysiwys'),

    /*
    |--------------------------------------------------------------------------
    | Upload
    |--------------------------------------------------------------------------
    |
    | Taille maximale en kilo-octets et extensions autorisées. Le SVG est
    | volontairement exclu : il peut contenir du JavaScript.
    |
    */

    'max_size' => 5120,

    'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],

    /*
    |--------------------------------------------------------------------------
    | Routes
    |--------------------------------------------------------------------------
    |
    | Préfixe et middlewares des routes d'upload et de la galerie. Les assets
    | (JS / CSS) sont toujours servis publiquement.
    |
    */

    'route_prefix' => 'wysiwys',

    'middleware' => ['web', 'auth'],

];
