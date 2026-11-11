# À faire

Ce qu'il reste avant de pouvoir annoncer une version 1.0, puis les bugs connus et les pistes
d'évolution. La 1.0 engage la stabilité de l'API publique (versionnage sémantique) : tant que
les cases de la première section ne sont pas cochées, on reste en 0.x.

## Avant la 1.0

### Fiabilité

- [ ] **Faire d'autres sessions de tests complètes.** Une seule session a trouvé deux vrais bugs
      (habillage des images, listes invalides) ; une autre en trouverait probablement d'autres.
- [ ] **Tester sur Firefox et Safari.** Seul Chrome a été testé. L'éditeur repose sur
      `execCommand`, qui se comporte différemment selon les navigateurs : les corrections des
      images flottantes et des listes contournent des comportements propres à Chrome, et
      Firefox ou Safari peuvent produire un autre HTML.
- [ ] **Tester sur mobile et tablette** : sélection d'une image au toucher, poignées de
      redimensionnement, barre d'outils qui passe sur deux lignes, clavier virtuel.
- [ ] **Vérifier l'annulation (Ctrl+Z).** Plusieurs corrections modifient le DOM sans passer par
      `execCommand` (images ramenées en début de ligne, listes sorties des paragraphes).
      Ces modifications ne sont pas dans la pile d'annulation du navigateur, et Ctrl+Z peut
      donner un résultat incohérent juste après.

### Tests automatisés

- [ ] **Couvrir le JavaScript.** Les 31 tests Pest couvrent le PHP (Sanitizer, upload,
      composant) ; l'éditeur lui-même ne se vérifie qu'à la main.
- [ ] **Tests navigateur** (Laravel Dusk ou Playwright) sur la page de démo du workbench, pour
      rejouer le tour des fonctionnalités à chaque modification : mise en forme, blocs, listes
      (création, Entrée, Tab, désactivation), liens, couleur, tableau, séparateur, images
      (envoi, bibliothèque, alignements, texte alternatif, redimensionnement, suppression),
      aperçu, plein écran, enregistrement.
- [ ] Faire tourner ces tests sur Chrome **et** Firefox (Playwright sait le faire).
- [ ] Tests du collage (`paste`) depuis Word, Google Docs et une page web : c'est la source de
      HTML la plus imprévisible.

### API publique

- [ ] **Faire servir l'éditeur dans un vrai projet** pendant quelques semaines sans changer
      l'API. Les noms des boutons de la barre d'outils, les options du composant, la config
      et les classes CSS deviennent un contrat dès la 1.0 : les renommer après casserait la
      compatibilité.
- [ ] Relire les noms avant de les figer : boutons (`imageLeft`, `alignLeft`…), attributs
      `data-*`, variables CSS `--wysiwys-*`, clés de config, méthodes JS (`Wysiwys.init`,
      `setHtml`, `getHtml`).
- [ ] Décider ce qui est public et ce qui est interne côté JS (les méthodes de `Editor` sont
      toutes accessibles aujourd'hui).
- [ ] Documenter l'API publique dans le README : liste des boutons de la barre d'outils,
      attributs du composant Blade, routes, événements.
- [ ] Ajouter un `CHANGELOG.md` et y reporter les notes de chaque version.

## Bugs et défauts connus

- [ ] **URL absolue pour les images envoyées.** Une image envoyée est insérée avec une URL
      complète (`http://127.0.0.1:8123/storage/wysiwys/…`). Le contenu enregistré dépend alors
      du domaine : un changement de domaine, ou une base copiée de la préproduction vers la
      production, casse les images. Préférer une URL relative (`/storage/wysiwys/…`).
- [ ] **Suppression d'une image du serveur** : les contenus qui l'utilisent affichent une image
      cassée sans prévenir. Piste : signaler qu'elle est utilisée dans l'éditeur ouvert, ou
      laisser l'application fournir un contrôle d'usage.
- [ ] **Image dans un lien** (`<a><img></a>`) : une image flottante n'est ramenée en début de
      ligne qu'à l'intérieur du lien, l'habillage peut encore casser.
- [ ] **Alignement perdu en liste** : un paragraphe centré transformé en liste perd son
      alignement.
- [ ] **Sous-listes** produites en `<ol><ol>…` au lieu d'être imbriquées dans un `<li>` :
      accepté par les navigateurs, mais pas du HTML valide.
- [ ] **Aligner à gauche** écrit `text-align: left` au lieu de retirer l'alignement.
- [ ] **Sélection mémorisée** : `exec()` restaure la plage enregistrée à la dernière
      `selectionchange`. Si l'événement arrive en retard, la commande s'applique à l'ancienne
      position. Piste : garder la sélection courante quand elle est déjà dans l'éditeur.

## Ergonomie

- [ ] Après l'insertion d'un tableau, placer le curseur dans la première cellule.
- [ ] Tab / Maj+Tab pour passer d'une cellule à l'autre, et Tab dans la dernière cellule
      pour ajouter une ligne.
- [ ] Tableau : ajouter et supprimer des lignes et des colonnes, supprimer le tableau.
- [ ] Image insérée depuis la bibliothèque : proposer de remplir le texte alternatif (il est
      vide aujourd'hui).
- [ ] Annuler / rétablir dans la barre d'outils.
- [ ] Raccourcis Markdown à la frappe (`# `, `- `, `1. `, `> `).

## Accessibilité

- [ ] Navigation au clavier dans la barre d'outils (flèches, `roving tabindex`).
- [ ] Menus couleur et tableau utilisables au clavier, avec les bons rôles ARIA.
- [ ] Sélectionner et aligner une image sans souris.
- [ ] Vérifier le rendu avec un lecteur d'écran (NVDA, VoiceOver).

## Long terme

- [ ] `execCommand` est déprécié. Il fonctionne partout et n'a pas de remplaçant direct, mais
      chaque contournement ajouté pour un navigateur rend l'éditeur plus fragile. À surveiller :
      l'API Input Events (`beforeinput`) pour reprendre la main sur les commandes une par une.
- [ ] Traductions : l'interface est en français uniquement (titres des boutons, dialogues).
