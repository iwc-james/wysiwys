<?php

namespace IwcJames\Wysiwys;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImageLibrary
{
    /**
     * Chemin du dossier, relatif à public/ (sans slash de début ni de fin).
     */
    public function directory(): string
    {
        return trim(str_replace('\\', '/', config('wysiwys.directory')), '/');
    }

    public function path(string $file = ''): string
    {
        return public_path($this->directory().($file !== '' ? '/'.$file : ''));
    }

    public function url(string $file): string
    {
        return asset($this->directory().'/'.$file);
    }

    /**
     * @return array<int, array{name: string, url: string, size: int, modified: int}>
     */
    public function all(): array
    {
        if (! File::isDirectory($this->path())) {
            return [];
        }

        $extensions = config('wysiwys.extensions');

        return collect(File::files($this->path()))
            ->filter(fn ($file) => in_array(strtolower($file->getExtension()), $extensions, true))
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->map(fn ($file) => [
                'name' => $file->getFilename(),
                'url' => $this->url($file->getFilename()),
                'size' => $file->getSize(),
                'modified' => $file->getMTime(),
            ])
            ->values()
            ->all();
    }

    public function store(UploadedFile $upload): string
    {
        File::ensureDirectoryExists($this->path());

        $extension = strtolower($upload->getClientOriginalExtension());
        $base = Str::slug(pathinfo($upload->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'image';
        $name = $base.'.'.$extension;

        for ($i = 1; File::exists($this->path($name)); $i++) {
            $name = $base.'-'.$i.'.'.$extension;
        }

        $upload->move($this->path(), $name);

        return $name;
    }

    /**
     * Supprime une image du dossier. Seuls les noms de fichier simples avec une
     * extension autorisée sont acceptés (pas de chemin, pas de « .. »).
     */
    public function delete(string $name): bool
    {
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if ($name !== basename($name)
            || str_starts_with($name, '.')
            || ! in_array($extension, config('wysiwys.extensions'), true)
            || ! File::isFile($this->path($name))) {
            return false;
        }

        return File::delete($this->path($name));
    }
}
