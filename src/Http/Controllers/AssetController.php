<?php

namespace IwcJames\Wysiwys\Http\Controllers;

use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AssetController extends Controller
{
    public function __invoke(string $file): BinaryFileResponse
    {
        $type = str_ends_with($file, '.js') ? 'js' : 'css';
        $path = __DIR__.'/../../../resources/'.$type.'/'.$file;

        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => $type === 'js' ? 'application/javascript; charset=utf-8' : 'text/css; charset=utf-8',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
