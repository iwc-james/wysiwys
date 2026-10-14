@once
    <link rel="stylesheet" href="{{ route('wysiwys.asset', 'wysiwys.css') }}?v={{ $assetVersion() }}">
    <script src="{{ route('wysiwys.asset', 'wysiwys.js') }}?v={{ $assetVersion() }}" defer></script>
@endonce

<div {{ $attributes->class('wysiwys') }}
     data-wysiwys
     data-upload-url="{{ route('wysiwys.images.store') }}"
     data-images-url="{{ route('wysiwys.images.index') }}"
     data-csrf="{{ csrf_token() }}"
     data-placeholder="{{ $placeholder }}"
     data-height="{{ $height }}"
     @if ($toolbar) data-toolbar="{{ $toolbar }}" @endif>
    <textarea name="{{ $name }}" id="{{ $id }}" class="wysiwys-source" hidden>{{ $content() }}</textarea>
</div>
