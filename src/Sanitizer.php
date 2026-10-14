<?php

namespace IwcJames\Wysiwys;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Nettoie le HTML produit par l'éditeur : seules les balises, attributs et
 * styles que l'éditeur sait générer sont conservés. À appliquer avant
 * l'enregistrement ou avant l'affichage avec {!! !!}.
 */
class Sanitizer
{
    /** Balises conservées (les autres sont retirées mais leur contenu est gardé). */
    public const TAGS = [
        'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
        'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a', 'br', 'hr',
        'ul', 'ol', 'li', 'img',
    ];

    /** Balises supprimées avec tout leur contenu. */
    public const DROP = [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea',
        'select', 'option', 'meta', 'link', 'title', 'head', 'svg', 'math', 'noscript', 'template',
    ];

    /** Attributs autorisés par balise ('*' = toutes). */
    public const ATTRIBUTES = [
        '*' => ['style'],
        'a' => ['href', 'target', 'title'],
        'img' => ['src', 'alt', 'title', 'width', 'height'],
        'ol' => ['start'],
    ];

    /** Propriétés CSS autorisées et format accepté. */
    public const STYLES = [
        'text-align' => '/^(left|center|right|justify)$/',
        'color' => '/^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.%\s,\/]+\)|[a-z]+)$/',
        'margin-left' => '/^\d+(\.\d+)?(px|em|rem)$/',
        'padding-left' => '/^\d+(\.\d+)?(px|em|rem)$/',
    ];

    public static function clean(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $doc = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $doc->loadHTML(
            '<?xml encoding="utf-8"?><div>'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementsByTagName('div')->item(0);

        if (! $root) {
            return '';
        }

        static::cleanChildren($root);

        $output = '';
        foreach ($root->childNodes as $child) {
            $output .= $doc->saveHTML($child);
        }

        return trim($output);
    }

    protected static function cleanChildren(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                static::cleanElement($child);
            } elseif ($child->nodeType !== XML_TEXT_NODE) {
                $node->removeChild($child);
            }
        }
    }

    protected static function cleanElement(DOMElement $element): void
    {
        $tag = strtolower($element->tagName);

        if (in_array($tag, static::DROP, true)) {
            $element->parentNode->removeChild($element);

            return;
        }

        static::cleanChildren($element);

        if (! in_array($tag, static::TAGS, true)) {
            while ($element->firstChild) {
                $element->parentNode->insertBefore($element->firstChild, $element);
            }
            $element->parentNode->removeChild($element);

            return;
        }

        $allowed = array_merge(static::ATTRIBUTES['*'], static::ATTRIBUTES[$tag] ?? []);

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->name);
            $value = static::cleanAttribute($tag, $name, $attribute->value, $allowed);

            if ($value === null) {
                $element->removeAttribute($attribute->name);
            } elseif ($value !== $attribute->value) {
                $element->setAttribute($attribute->name, $value);
            }
        }

        if ($tag === 'a' && $element->getAttribute('target') === '_blank') {
            $element->setAttribute('rel', 'noopener noreferrer');
        }

        if ($tag === 'img' && ! $element->hasAttribute('src')) {
            $element->parentNode->removeChild($element);
        }
    }

    protected static function cleanAttribute(string $tag, string $name, string $value, array $allowed): ?string
    {
        if (! in_array($name, $allowed, true)) {
            return null;
        }

        return match ($name) {
            'style' => static::cleanStyle($value),
            'href' => static::cleanUrl($value, ['http', 'https', 'mailto', 'tel']),
            'src' => static::cleanUrl($value, ['http', 'https']),
            'target' => $value === '_blank' ? '_blank' : null,
            'width', 'height', 'start' => ctype_digit($value) ? $value : null,
            default => $value,
        };
    }

    protected static function cleanStyle(string $style): ?string
    {
        $kept = [];

        foreach (explode(';', $style) as $declaration) {
            [$property, $value] = array_pad(explode(':', $declaration, 2), 2, '');
            $property = strtolower(trim($property));
            $value = strtolower(trim($value));

            if (isset(static::STYLES[$property]) && preg_match(static::STYLES[$property], $value)) {
                $kept[] = $property.': '.$value;
            }
        }

        return $kept ? implode('; ', $kept).';' : null;
    }

    protected static function cleanUrl(string $url, array $schemes): ?string
    {
        $url = trim($url);
        $compact = preg_replace('/[\x00-\x20]+/', '', $url);

        if (preg_match('/^([a-z][a-z0-9+.\-]*):/i', $compact, $match)) {
            return in_array(strtolower($match[1]), $schemes, true) ? $url : null;
        }

        return $url;
    }
}
