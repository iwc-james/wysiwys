# Wysiwys

Éditeur WYSIWYG simple pour Laravel 11 / 12 / 13. Aucune dépendance JavaScript ni build npm.

- Niveaux (paragraphe, titres 1 à 4, citation), gras, italique
- Listes à puces / numérotées, alignements, retraits
- Liens (ajout, modification, suppression), séparateur, couleur du texte
- Images : envoi depuis l'ordinateur, choix parmi les images du serveur (avec suppression), collage et glisser-déposer
- Redimensionnement des images à la souris via des poignées d'angle (double-clic sur une poignée : taille d'origine)
- Plein écran, aperçu
- Les images sont écrites **directement dans `public/`** : pas besoin de `php artisan storage:link`

## Installation

Dans le `composer.json` du projet :

```json
"repositories": [
    { "type": "vcs", "url": "https://github.com/iwc-james/wysiwys" }
]
```

puis :

```bash
composer require iwc-james/wysiwys
```

Repo privé : créer un token GitHub (fine-grained, accès en lecture « Contents » sur ce repo) puis
`composer config --global github-oauth.github.com <TOKEN>` sur la machine qui lance Composer.

## Utilisation

```blade
<form method="post" action="{{ route('articles.update', $article) }}">
    @csrf
    <x-wysiwys name="body" :value="$article->body" placeholder="Votre texte…" :height="400" />
    <button>Enregistrer</button>
</form>
```

Le contenu HTML est envoyé dans le champ `body` comme un champ classique. En cas d'erreur de validation,
la saisie précédente (`old()`) est reprise automatiquement.

Options du composant :

| Attribut      | Défaut   | Rôle                                         |
|---------------|----------|----------------------------------------------|
| `name`        | —        | Nom du champ du formulaire                   |
| `value`       | `null`   | Contenu HTML initial                         |
| `placeholder` | `''`     | Texte affiché quand l'éditeur est vide       |
| `height`      | `300`    | Hauteur minimale en pixels                   |
| `toolbar`     | complète | Boutons à afficher (voir ci-dessous)         |

Barre d'outils réduite, groupes séparés par `|` :

```blade
<x-wysiwys name="intro" toolbar="block | bold italic | link unlink" />
```

Boutons disponibles : `block bold underline italic ul ol alignLeft alignCenter alignRight outdent indent link unlink color table hr image preview fullscreen`.

## Sécurité : nettoyer le HTML

Le HTML envoyé par le navigateur peut être modifié par l'utilisateur. Nettoie-le avant de l'enregistrer :

```php
use IwcJames\Wysiwys\Sanitizer;

$article->body = Sanitizer::clean($request->input('body'));
```

Seules les balises, attributs et styles produits par l'éditeur sont conservés (pas de `<script>`,
`onclick`, `javascript:`, etc.).

Affichage côté site :

```blade
<div class="wysiwys-content">{!! $article->body !!}</div>
```

La classe `wysiwys-content` applique la mise en forme de l'éditeur si sa feuille de style est chargée :
`<link rel="stylesheet" href="{{ route('wysiwys.asset', 'wysiwys.css') }}">`.

## Configuration

```bash
php artisan vendor:publish --tag=wysiwys-config
```

```php
// config/wysiwys.php
'directory'    => 'storage/wysiwys',   // relatif à public/
'max_size'     => 5120,                // Ko
'extensions'   => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
'route_prefix' => 'wysiwys',
'middleware'   => ['web', 'auth'],     // qui peut envoyer / lister / supprimer les images
```

Le dossier peut aussi être défini par `WYSIWYS_DIRECTORY` dans le `.env`.

> Si `public/storage` est déjà un lien symbolique vers `storage/app/public`, les images y atterrissent
> aussi : ça fonctionne de la même façon.

La suppression d'une image depuis la galerie est définitive : les contenus qui l'utilisent afficheront
une image cassée. Pour réserver l'upload et la suppression aux administrateurs, ajoute ton propre middleware : `['web', 'auth', 'can:admin']`.

Pour modifier le HTML du composant : `php artisan vendor:publish --tag=wysiwys-views`.

Pour changer les couleurs, surcharge les variables CSS :

```css
.wysiwys { --wysiwys-accent: #0d9488; --wysiwys-radius: 0; }
```

Ajoute la classe `wysiwys-auto-dark` (`<x-wysiwys class="wysiwys-auto-dark" … />`) pour suivre le mode sombre du système.

## JavaScript

Les éditeurs présents au chargement de la page démarrent seuls. Pour du contenu ajouté plus tard :

```js
Wysiwys.init(element);              // démarre les éditeurs contenus dans element
element.querySelector('[data-wysiwys]').wysiwys.setHtml('<p>…</p>');
```

## Développement

```bash
composer install
composer test     # tests Pest
composer serve    # page de démo (Orchestra Testbench) sur http://127.0.0.1:8000
```

## Vibe coded with love

Ce package a été entièrement « vibe codé » avec [Claude Code](https://claude.com/claude-code), l'outil de programmation agentique d'[Anthropic](https://www.anthropic.com), qui s'appuie sur les modèles [Claude](https://www.anthropic.com/claude). Le code a été écrit par l'IA à partir de mes instructions, puis testé et relu par moi.

Concrètement, ça veut dire :

- le code n'a pas fait l'objet d'un audit de sécurité indépendant ; la partie nettoyage du HTML est couverte par des tests, mais relisez-la avant de l'utiliser avec du contenu non fiable ;
- des bugs ou des choix discutables sont possibles : les retours et les *issues* sont les bienvenus.

Les commits écrits avec l'assistance de Claude portent la mention `Co-Authored-By`.
