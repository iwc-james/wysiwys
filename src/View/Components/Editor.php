<?php

namespace IwcJames\Wysiwys\View\Components;

use Illuminate\Support\Str;
use Illuminate\View\Component;
use Illuminate\View\View;

class Editor extends Component
{
    public string $id;

    public function __construct(
        public string $name,
        public ?string $value = null,
        ?string $id = null,
        public string $placeholder = '',
        public int $height = 300,
        public ?string $toolbar = null,
    ) {
        $this->id = $id ?? 'wysiwys-'.Str::slug($name).'-'.Str::random(6);
    }

    /**
     * Valeur à afficher : la saisie précédente en cas d'erreur de validation,
     * sinon la valeur fournie.
     */
    public function content(): string
    {
        $key = trim(str_replace(['[', ']'], ['.', ''], $this->name), '.');

        return (string) old($key, $this->value);
    }

    public function assetVersion(): string
    {
        $dir = __DIR__.'/../../../resources';

        return substr(md5(filemtime($dir.'/js/wysiwys.js').'-'.filemtime($dir.'/css/wysiwys.css')), 0, 8);
    }

    public function render(): View
    {
        return view('wysiwys::components.editor');
    }
}
