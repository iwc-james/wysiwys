<?php

namespace IwcJames\Wysiwys\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use IwcJames\Wysiwys\ImageLibrary;

class ImageController extends Controller
{
    public function __construct(protected ImageLibrary $library) {}

    public function index(): JsonResponse
    {
        return response()->json(['images' => $this->library->all()]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:'.implode(',', config('wysiwys.extensions')),
                'max:'.config('wysiwys.max_size'),
            ],
        ]);

        $name = $this->library->store($request->file('image'));

        return response()->json([
            'name' => $name,
            'url' => $this->library->url($name),
        ], 201);
    }

    public function destroy(string $name): Response
    {
        abort_unless($this->library->delete($name), 404);

        return response()->noContent();
    }
}
