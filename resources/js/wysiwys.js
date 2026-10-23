/*!
 * Wysiwys — éditeur WYSIWYG simple pour Laravel.
 * Aucune dépendance : contenteditable + document.execCommand.
 */
(function () {
    'use strict';

    if (window.Wysiwys) {
        return;
    }

    /* ------------------------------------------------------------------ */
    /* Icônes (dessins type Lucide, 24x24, trait)                          */
    /* ------------------------------------------------------------------ */

    var ICONS = {
        bold: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
        underline: '<path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/>',
        italic: '<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
        ul: '<path d="M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13"/>',
        ol: '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
        alignLeft: '<path d="M21 6H3M15 12H3M17 18H3"/>',
        alignCenter: '<path d="M21 6H3M17 12H7M19 18H5"/>',
        alignRight: '<path d="M21 6H3M21 12H9M21 18H7"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        unlink: '<path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71"/><path d="M8 2v3M2 8h3M16 19v3M19 16h3"/>',
        table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
        chevron: '<path d="m6 9 6 6 6-6"/>',
        hr: '<path d="M3 12h18"/><path d="M8 6h8M8 18h8" opacity=".35"/>',
        color: '<path d="m6 16 6-12 6 12M8 12h8"/>',
        outdent: '<path d="M21 6H11M21 12H11M21 18H11M7 8l-4 4 4 4"/>',
        indent: '<path d="M21 6H11M21 12H11M21 18H11M3 8l4 4-4 4"/>',
        image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
        preview: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        fullscreen: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
        exitFullscreen: '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>',
        close: '<path d="M18 6 6 18M6 6l12 12"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
        imageInline: '<rect width="10" height="8" x="7" y="8" rx="1"/><path d="M3 4h18M3 20h18M3 12h1M20 12h1"/>',
        imageLeft: '<rect width="9" height="9" x="3" y="4" rx="1"/><path d="M16 5h5M16 12h5M3 19h18"/>',
        imageCenter: '<rect width="10" height="9" x="7" y="4" rx="1"/><path d="M3 19h18"/>',
        imageRight: '<rect width="9" height="9" x="12" y="4" rx="1"/><path d="M3 5h5M3 12h5M3 19h18"/>'
    };

    function icon(name) {
        return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
    }

    /* ------------------------------------------------------------------ */
    /* Configuration de la barre d'outils                                  */
    /* ------------------------------------------------------------------ */

    var BLOCKS = [
        ['p', 'Paragraphe'],
        ['h1', 'Titre 1'],
        ['h2', 'Titre 2'],
        ['h3', 'Titre 3'],
        ['h4', 'Titre 4'],
        ['blockquote', 'Citation']
    ];

    var COLORS = [
        '#000000', '#475569', '#94a3b8', '#dc2626', '#ea580c', '#ca8a04',
        '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#db2777'
    ];

    // Taille de la grille de choix d'un tableau : elle s'agrandit au survol jusqu'au maximum.
    var TABLE_GRID = { min: 5, max: 10 };

    // Groupes séparés par « | ».
    var DEFAULT_TOOLBAR = 'block | bold underline italic | ul ol | alignLeft alignCenter alignRight | outdent indent | ' +
        'link unlink | color table hr image | preview fullscreen';

    var BUTTONS = {
        bold: { title: 'Gras (Ctrl+B)', state: 'bold', run: function (ed) { ed.exec('bold'); } },
        underline: { title: 'Souligné (Ctrl+U)', state: 'underline', run: function (ed) { ed.exec('underline'); } },
        italic: { title: 'Italique (Ctrl+I)', state: 'italic', run: function (ed) { ed.exec('italic'); } },
        ul: { title: 'Liste à puces', state: 'insertUnorderedList', run: function (ed) { ed.exec('insertUnorderedList'); } },
        ol: { title: 'Liste numérotée', state: 'insertOrderedList', run: function (ed) { ed.exec('insertOrderedList'); } },
        alignLeft: { title: 'Aligner à gauche', state: 'justifyLeft', run: function (ed) { ed.exec('justifyLeft'); } },
        alignCenter: { title: 'Centrer', state: 'justifyCenter', run: function (ed) { ed.exec('justifyCenter'); } },
        alignRight: { title: 'Aligner à droite', state: 'justifyRight', run: function (ed) { ed.exec('justifyRight'); } },
        outdent: { title: 'Diminuer le retrait', run: function (ed) { ed.indent(-1); } },
        indent: { title: 'Augmenter le retrait', run: function (ed) { ed.indent(1); } },
        link: { title: 'Insérer un lien (Ctrl+K)', run: function (ed) { ed.openLinkDialog(); } },
        unlink: { title: 'Supprimer le lien', run: function (ed) { ed.removeLink(); } },
        table: { title: 'Insérer un tableau', run: function (ed, button) { ed.toggleTableMenu(button); } },
        hr: { title: 'Insérer un séparateur', run: function (ed) { ed.insertSeparator(); } },
        color: { title: 'Couleur du texte', run: function (ed, button) { ed.toggleColorMenu(button); } },
        image: { title: 'Insérer une image', run: function (ed) { ed.openImageDialog(); } },
        preview: { title: 'Aperçu', run: function (ed) { ed.openPreview(); } },
        fullscreen: { title: 'Plein écran (Échap pour sortir)', run: function (ed) { ed.toggleFullscreen(); } }
    };

    /* ------------------------------------------------------------------ */
    /* Nettoyage HTML (même règles que IwcJames\Wysiwys\Sanitizer)         */
    /* ------------------------------------------------------------------ */

    var TAGS = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'strong', 'b', 'em',
        'i', 'u', 's', 'span', 'a', 'br', 'hr', 'ul', 'ol', 'li', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
    var DROP = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select',
        'option', 'meta', 'link', 'title', 'head', 'svg', 'math', 'noscript', 'template'];
    var ATTRIBUTES = { a: ['href', 'target', 'title'], img: ['src', 'alt', 'title', 'width', 'height'], ol: ['start'] };
    var STYLES = {
        'text-align': /^(left|center|right|justify)$/,
        'color': /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.%\s,\/]+\)|[a-z]+)$/,
        'margin-left': /^\d+(\.\d+)?(px|em|rem)$/,
        'padding-left': /^\d+(\.\d+)?(px|em|rem)$/,
        // Alignement des images (habillage ou centrage).
        'float': /^(left|right)$/,
        'display': /^block$/,
        'margin': /^(\d+(\.\d+)?(px|em|rem)?|auto)( (\d+(\.\d+)?(px|em|rem)?|auto)){0,3}$/
    };

    function cleanUrl(url, schemes) {
        var compact = url.trim().replace(/[\x00-\x20]+/g, '');
        var match = compact.match(/^([a-z][a-z0-9+.\-]*):/i);
        return !match || schemes.indexOf(match[1].toLowerCase()) !== -1 ? url.trim() : null;
    }

    function cleanStyle(style) {
        var kept = [];
        style.split(';').forEach(function (declaration) {
            var parts = declaration.split(':');
            var property = (parts.shift() || '').trim().toLowerCase();
            var value = parts.join(':').trim().toLowerCase();
            if (STYLES[property] && STYLES[property].test(value)) {
                kept.push(property + ': ' + value);
            }
        });
        return kept.length ? kept.join('; ') + ';' : null;
    }

    function cleanNode(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
            if (child.nodeType === 3) {
                return;
            }
            if (child.nodeType !== 1) {
                child.remove();
                return;
            }
            var tag = child.tagName.toLowerCase();
            if (DROP.indexOf(tag) !== -1) {
                child.remove();
                return;
            }
            cleanNode(child);
            if (TAGS.indexOf(tag) === -1) {
                while (child.firstChild) {
                    node.insertBefore(child.firstChild, child);
                }
                child.remove();
                return;
            }
            var allowed = ['style'].concat(ATTRIBUTES[tag] || []);
            Array.prototype.slice.call(child.attributes).forEach(function (attribute) {
                var name = attribute.name.toLowerCase();
                var value = attribute.value;
                var cleaned = null;
                if (allowed.indexOf(name) !== -1) {
                    if (name === 'style') cleaned = cleanStyle(value);
                    else if (name === 'href') cleaned = cleanUrl(value, ['http', 'https', 'mailto', 'tel']);
                    else if (name === 'src') cleaned = cleanUrl(value, ['http', 'https']);
                    else if (name === 'target') cleaned = value === '_blank' ? '_blank' : null;
                    else if (['width', 'height', 'start'].indexOf(name) !== -1) cleaned = /^\d+$/.test(value) ? value : null;
                    else cleaned = value;
                }
                if (cleaned === null) child.removeAttribute(attribute.name);
                else if (cleaned !== value) child.setAttribute(attribute.name, cleaned);
            });
            if (tag === 'a' && child.getAttribute('target') === '_blank') {
                child.setAttribute('rel', 'noopener noreferrer');
            }
            if (tag === 'img' && !child.hasAttribute('src')) {
                child.remove();
            }
        });
    }

    function clean(html) {
        var doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
        var root = doc.body.firstChild;
        cleanNode(root);
        return root.innerHTML.trim();
    }

    /* ------------------------------------------------------------------ */
    /* Utilitaires                                                         */
    /* ------------------------------------------------------------------ */

    function el(tag, attrs, html) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            node.setAttribute(key, attrs[key]);
        });
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function closest(node, selector, root) {
        while (node && node !== root) {
            if (node.nodeType === 1 && node.matches(selector)) return node;
            node = node.parentNode;
        }
        return null;
    }

    /* ------------------------------------------------------------------ */
    /* Éditeur                                                             */
    /* ------------------------------------------------------------------ */

    function Editor(container) {
        this.container = container;
        this.source = container.querySelector('textarea');
        this.options = container.dataset;
        this.range = null;

        this.build();
        this.bind();
        this.setHtml(this.source.value);
        container.wysiwys = this;
    }

    Editor.prototype.build = function () {
        var self = this;

        this.toolbar = el('div', { 'class': 'wysiwys-toolbar', role: 'toolbar' });
        this.buttons = {};

        (this.options.toolbar || DEFAULT_TOOLBAR).split('|').forEach(function (group) {
            var groupEl = el('div', { 'class': 'wysiwys-group' });
            group.trim().split(/\s+/).forEach(function (name) {
                if (name === 'block') {
                    groupEl.appendChild(self.buildBlockSelect());
                } else if (BUTTONS[name]) {
                    var button = el('button', {
                        type: 'button', 'class': 'wysiwys-btn', title: BUTTONS[name].title,
                        'aria-label': BUTTONS[name].title, 'data-action': name
                    }, icon(name));
                    if (name === 'color') {
                        button.appendChild(el('span', { 'class': 'wysiwys-color-bar' }));
                    }
                    if (name === 'table') {
                        button.classList.add('wysiwys-btn-menu');
                        button.insertAdjacentHTML('beforeend', icon('chevron'));
                    }
                    self.buttons[name] = button;
                    groupEl.appendChild(button);
                }
            });
            if (groupEl.childNodes.length) self.toolbar.appendChild(groupEl);
        });

        this.editable = el('div', {
            'class': 'wysiwys-content wysiwys-editable',
            contenteditable: 'true',
            role: 'textbox',
            'aria-multiline': 'true',
            'data-placeholder': this.options.placeholder || ''
        });
        this.editable.style.minHeight = (parseInt(this.options.height, 10) || 300) + 'px';

        this.container.insertBefore(this.toolbar, this.source);
        this.container.insertBefore(this.editable, this.source);
        this.buildImageFrame();
    };

    Editor.prototype.buildBlockSelect = function () {
        var select = el('select', { 'class': 'wysiwys-select', title: 'Niveau', 'aria-label': 'Niveau' });
        BLOCKS.forEach(function (block) {
            select.appendChild(el('option', { value: block[0] }, block[1]));
        });
        this.blockSelect = select;
        return select;
    };

    Editor.prototype.bind = function () {
        var self = this;

        // Garder la sélection dans l'éditeur quand on clique un bouton.
        this.toolbar.addEventListener('mousedown', function (e) {
            if (e.target.closest('button')) e.preventDefault();
        });

        this.toolbar.addEventListener('click', function (e) {
            var button = e.target.closest('button[data-action]');
            if (!button) return;
            BUTTONS[button.dataset.action].run(self, button);
            self.refreshState();
        });

        this.blockSelect && this.blockSelect.addEventListener('change', function () {
            self.exec('formatBlock', '<' + self.blockSelect.value + '>');
        });

        this.editable.addEventListener('input', function () {
            self.sync();
            self.positionImageFrame();
        });
        this.editable.addEventListener('keyup', function () { self.refreshState(); });
        this.editable.addEventListener('mouseup', function () { self.refreshState(); });

        // Firefox : désactiver ses poignées natives au profit des nôtres.
        try { document.execCommand('enableObjectResizing', false, 'false'); } catch (e) { /* ignoré */ }

        this.editable.addEventListener('click', function (e) {
            if (e.target.tagName === 'IMG') self.selectImage(e.target);
        });
        this.editable.addEventListener('scroll', function () { self.positionImageFrame(); });
        window.addEventListener('resize', function () { self.positionImageFrame(); });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { self.positionImageFrame(); }).observe(this.editable);
        }

        this.editable.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && self.image) {
                e.stopPropagation();
                var range = document.createRange();
                range.setStartAfter(self.image);
                range.collapse(true);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                self.deselectImage();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                self.openLinkDialog();
            }
            if (e.key === 'Tab' && closest(self.currentNode(), 'li', self.editable)) {
                e.preventDefault();
                self.exec(e.shiftKey ? 'outdent' : 'indent');
            }
        });

        this.editable.addEventListener('paste', function (e) { self.onPaste(e); });
        this.editable.addEventListener('drop', function (e) { self.onDrop(e); });

        document.addEventListener('selectionchange', function () {
            var selection = window.getSelection();
            if (selection.rangeCount && self.editable.contains(selection.getRangeAt(0).commonAncestorContainer)) {
                var range = selection.getRangeAt(0);
                self.range = range.cloneRange();
                // La sélection a quitté l'image (flèches, clic dans le texte…).
                if (self.image && (range.collapsed || !range.intersectsNode(self.image))) {
                    self.deselectImage();
                }
            }
        });

        document.addEventListener('mousedown', function (e) {
            if (self.image && !self.container.contains(e.target)) self.deselectImage();
        });

        var form = this.container.closest('form');
        if (form) form.addEventListener('submit', function () { self.sync(); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && self.container.classList.contains('is-fullscreen') && !document.querySelector('dialog[open]')) {
                self.toggleFullscreen();
            }
        });

        document.addEventListener('click', function (e) {
            if (self.colorMenu && !self.colorMenu.contains(e.target) && !e.target.closest('[data-action="color"]')) {
                self.closeColorMenu();
            }
            if (self.tableMenu && !self.tableMenu.contains(e.target) && !e.target.closest('[data-action="table"]')) {
                self.closeTableMenu();
            }
        });
    };

    /* ----- Contenu ----- */

    Editor.prototype.setHtml = function (html) {
        this.deselectImage();
        this.editable.innerHTML = clean(html);
        this.sync();
    };

    Editor.prototype.getHtml = function () {
        var html = this.editable.innerHTML.trim();
        return /^(<p>(<br>)?<\/p>|<br>)?$/.test(html) ? '' : html;
    };

    Editor.prototype.sync = function () {
        this.source.value = this.getHtml();
        this.container.classList.toggle('is-empty', this.source.value === '');
    };

    /* ----- Sélection et commandes ----- */

    Editor.prototype.restoreSelection = function () {
        this.editable.focus();
        if (this.range) {
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.range);
        }
    };

    Editor.prototype.currentNode = function () {
        var selection = window.getSelection();
        if (!selection.rangeCount) return null;
        var node = selection.getRangeAt(0).startContainer;
        return this.editable.contains(node) ? node : null;
    };

    Editor.prototype.exec = function (command, value) {
        this.restoreSelection();
        document.execCommand('styleWithCSS', false, command === 'foreColor');
        document.execCommand('defaultParagraphSeparator', false, 'p');
        document.execCommand(command, false, value === undefined ? null : value);
        this.sync();
        this.refreshState();
    };

    Editor.prototype.insertHtml = function (html) {
        this.exec('insertHTML', html);
    };

    Editor.prototype.refreshState = function () {
        var self = this;
        Object.keys(this.buttons).forEach(function (name) {
            var state = BUTTONS[name].state;
            if (state) {
                var active = false;
                try { active = document.queryCommandState(state); } catch (e) { /* ignoré */ }
                self.buttons[name].classList.toggle('is-active', active && !!self.currentNode());
            }
        });
        if (this.blockSelect && this.currentNode()) {
            var block = closest(this.currentNode(), 'p,h1,h2,h3,h4,blockquote', this.editable);
            this.blockSelect.value = block ? block.tagName.toLowerCase() : 'p';
        }
    };

    /* ----- Retrait ----- */

    Editor.prototype.indent = function (direction) {
        this.restoreSelection();
        var node = this.currentNode();
        if (!node) return;

        if (closest(node, 'li', this.editable)) {
            this.exec(direction > 0 ? 'indent' : 'outdent');
            return;
        }

        var block = closest(node, 'p,h1,h2,h3,h4,h5,h6,blockquote,div,pre', this.editable);
        if (!block) {
            this.exec('formatBlock', '<p>');
            block = closest(this.currentNode(), 'p', this.editable);
            if (!block) return;
        }
        var current = parseFloat(block.style.marginLeft) || 0;
        var next = Math.max(0, current + direction * 2);
        block.style.marginLeft = next ? next + 'em' : '';
        if (!block.getAttribute('style')) block.removeAttribute('style');
        this.sync();
    };

    /* ----- Séparateur ----- */

    Editor.prototype.insertSeparator = function () {
        this.insertHtml('<hr><p><br></p>');
    };

    /* ----- Couleur ----- */

    Editor.prototype.toggleColorMenu = function (button) {
        if (this.colorMenu) {
            this.closeColorMenu();
            return;
        }
        var self = this;
        var menu = el('div', { 'class': 'wysiwys-popover', role: 'menu' });
        var grid = el('div', { 'class': 'wysiwys-swatches' });

        COLORS.forEach(function (color) {
            var swatch = el('button', { type: 'button', 'class': 'wysiwys-swatch', title: color, 'aria-label': color });
            swatch.style.background = color;
            swatch.addEventListener('mousedown', function (e) { e.preventDefault(); });
            swatch.addEventListener('click', function () { self.applyColor(color); });
            grid.appendChild(swatch);
        });
        menu.appendChild(grid);

        var custom = el('label', { 'class': 'wysiwys-custom-color' }, 'Autre couleur ');
        var input = el('input', { type: 'color', value: this.lastColor || '#000000' });
        input.addEventListener('change', function () { self.applyColor(input.value); });
        custom.appendChild(input);
        menu.appendChild(custom);

        button.parentNode.style.position = 'relative';
        menu.style.left = button.offsetLeft + 'px';
        button.parentNode.appendChild(menu);
        this.colorMenu = menu;
    };

    Editor.prototype.closeColorMenu = function () {
        if (this.colorMenu) this.colorMenu.remove();
        this.colorMenu = null;
    };

    Editor.prototype.applyColor = function (color) {
        this.lastColor = color;
        if (this.buttons.color) this.buttons.color.querySelector('.wysiwys-color-bar').style.background = color;
        this.exec('foreColor', color);
        this.closeColorMenu();
    };

    /* ----- Tableau ----- */

    Editor.prototype.toggleTableMenu = function (button) {
        if (this.tableMenu) {
            this.closeTableMenu();
            return;
        }
        var self = this;
        var menu = el('div', { 'class': 'wysiwys-popover', role: 'menu' });
        var grid = el('div', { 'class': 'wysiwys-table-grid' });
        var label = el('div', { 'class': 'wysiwys-table-size' }, '&nbsp;');
        var size = TABLE_GRID.min;

        // Redessine la grille et surligne les cases jusqu'à (cols, rows).
        function render(cols, rows) {
            size = Math.min(TABLE_GRID.max, Math.max(TABLE_GRID.min, cols + 1, rows + 1));
            grid.style.gridTemplateColumns = 'repeat(' + size + ', 18px)';
            while (grid.childNodes.length < size * size) {
                var cell = el('button', { type: 'button', 'class': 'wysiwys-table-cell' });
                cell.addEventListener('mousedown', function (e) { e.preventDefault(); });
                grid.appendChild(cell);
            }
            while (grid.childNodes.length > size * size) grid.lastChild.remove();
            Array.prototype.forEach.call(grid.childNodes, function (cell, index) {
                var col = index % size + 1;
                var row = Math.floor(index / size) + 1;
                cell.dataset.cols = col;
                cell.dataset.rows = row;
                cell.setAttribute('aria-label', col + ' x ' + row);
                cell.classList.toggle('is-active', col <= cols && row <= rows);
            });
            label.textContent = cols && rows ? cols + ' x ' + rows : '\u00a0';
        }

        function cellOf(e) {
            return e.target.closest('.wysiwys-table-cell');
        }

        grid.addEventListener('mouseover', function (e) {
            var cell = cellOf(e);
            if (cell) render(+cell.dataset.cols, +cell.dataset.rows);
        });
        grid.addEventListener('focusin', function (e) {
            var cell = cellOf(e);
            if (cell) render(+cell.dataset.cols, +cell.dataset.rows);
        });
        grid.addEventListener('click', function (e) {
            var cell = cellOf(e);
            if (cell) self.insertTable(+cell.dataset.cols, +cell.dataset.rows);
        });

        render(0, 0);
        menu.appendChild(grid);
        menu.appendChild(label);

        button.parentNode.style.position = 'relative';
        menu.style.left = button.offsetLeft + 'px';
        button.parentNode.appendChild(menu);
        this.tableMenu = menu;
    };

    Editor.prototype.closeTableMenu = function () {
        if (this.tableMenu) this.tableMenu.remove();
        this.tableMenu = null;
    };

    Editor.prototype.insertTable = function (cols, rows) {
        var row = '<tr>' + new Array(cols + 1).join('<td><br></td>') + '</tr>';
        this.closeTableMenu();
        this.insertHtml('<table><tbody>' + new Array(rows + 1).join(row) + '</tbody></table><p><br></p>');
    };

    /* ----- Dialogues ----- */

    Editor.prototype.dialog = function (title, body, actions) {
        var self = this;
        var dialog = el('dialog', { 'class': 'wysiwys-dialog' });
        var header = el('div', { 'class': 'wysiwys-dialog-header' }, '<strong>' + escapeHtml(title) + '</strong>');
        var close = el('button', { type: 'button', 'class': 'wysiwys-btn', 'aria-label': 'Fermer' }, icon('close'));
        close.addEventListener('click', function () { dialog.close(); });
        header.appendChild(close);

        var content = el('div', { 'class': 'wysiwys-dialog-body' });
        content.appendChild(body);

        dialog.appendChild(header);
        dialog.appendChild(content);

        if (actions) {
            var footer = el('div', { 'class': 'wysiwys-dialog-footer' });
            actions.forEach(function (action) { footer.appendChild(action); });
            dialog.appendChild(footer);
        }

        dialog.addEventListener('close', function () {
            dialog.remove();
            self.restoreSelection();
        });
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.close();
        });
        // Entrée dans un champ ne doit pas soumettre le formulaire parent.
        dialog.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
        });

        this.container.appendChild(dialog);
        dialog.showModal();
        return dialog;
    };

    function actionButton(label, primary) {
        return el('button', { type: 'button', 'class': 'wysiwys-action' + (primary ? ' is-primary' : '') }, escapeHtml(label));
    }

    function field(label, input) {
        var wrapper = el('label', { 'class': 'wysiwys-field' }, '<span>' + escapeHtml(label) + '</span>');
        wrapper.appendChild(input);
        return wrapper;
    }

    /* ----- Liens ----- */

    Editor.prototype.currentLink = function () {
        var node = this.range ? this.range.commonAncestorContainer : null;
        return node && this.editable.contains(node) ? closest(node, 'a', this.editable) : null;
    };

    Editor.prototype.openLinkDialog = function () {
        var self = this;
        var link = this.currentLink();
        var collapsed = !this.range || this.range.collapsed;

        var body = el('div');
        var url = el('input', { type: 'text', placeholder: 'https://…', value: link ? link.getAttribute('href') : '' });
        var text = el('input', { type: 'text', value: link ? link.textContent : '' });
        var blank = el('input', { type: 'checkbox' });
        blank.checked = link ? link.target === '_blank' : false;

        body.appendChild(field('Adresse', url));
        if (collapsed && !link) body.appendChild(field('Texte affiché', text));
        var check = el('label', { 'class': 'wysiwys-check' });
        check.appendChild(blank);
        check.appendChild(document.createTextNode(' Ouvrir dans un nouvel onglet'));
        body.appendChild(check);

        var cancel = actionButton('Annuler');
        var ok = actionButton(link ? 'Modifier' : 'Insérer', true);
        var dialog = this.dialog(link ? 'Modifier le lien' : 'Insérer un lien', body, [cancel, ok]);

        cancel.addEventListener('click', function () { dialog.close(); });

        function submit() {
            var href = url.value.trim();
            if (!href) {
                url.focus();
                return;
            }
            if (!/^([a-z][a-z0-9+.\-]*:|\/|#|\?)/i.test(href)) {
                href = (/^[^\s@]+@[^\s@]+$/.test(href) ? 'mailto:' : 'https://') + href;
            }
            dialog.close();
            self.applyLink(link, href, text.value.trim(), blank.checked, collapsed);
        }

        ok.addEventListener('click', submit);
        body.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }
        });
        url.focus();
    };

    Editor.prototype.applyLink = function (link, href, text, blank, collapsed) {
        var target = blank ? ' target="_blank" rel="noopener noreferrer"' : '';

        if (link) {
            link.setAttribute('href', href);
            if (blank) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            } else {
                link.removeAttribute('target');
                link.removeAttribute('rel');
            }
            this.sync();
            return;
        }

        if (collapsed) {
            this.insertHtml('<a href="' + escapeHtml(href) + '"' + target + '>' + escapeHtml(text || href) + '</a>');
            return;
        }

        this.exec('createLink', href);
        if (blank) {
            var range = this.range;
            Array.prototype.forEach.call(this.editable.querySelectorAll('a'), function (a) {
                if (a.getAttribute('href') === href && (!range || range.intersectsNode(a))) {
                    a.setAttribute('target', '_blank');
                    a.setAttribute('rel', 'noopener noreferrer');
                }
            });
            this.sync();
        }
    };

    Editor.prototype.removeLink = function () {
        this.restoreSelection();
        var link = this.currentLink();
        if (link && this.range.collapsed) {
            var range = document.createRange();
            range.selectNodeContents(link);
            this.range = range;
        }
        this.exec('unlink');
    };

    /* ----- Images ----- */

    Editor.prototype.request = function (method, url, body) {
        return fetch(url, {
            method: method,
            body: body,
            credentials: 'same-origin',
            headers: { 'X-CSRF-TOKEN': this.options.csrf, 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                if (!response.ok) {
                    var message = data.errors && data.errors.image ? data.errors.image[0] : (data.message || 'Erreur ' + response.status);
                    throw new Error(message);
                }
                return data;
            });
        });
    };

    Editor.prototype.upload = function (file) {
        var data = new FormData();
        data.append('image', file);
        return this.request('POST', this.options.uploadUrl, data);
    };

    Editor.prototype.insertImage = function (src, alt) {
        this.insertHtml('<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt || '') + '">');
    };

    Editor.prototype.openImageDialog = function () {
        var self = this;
        var selected = null;

        var body = el('div');
        var tabs = el('div', { 'class': 'wysiwys-tabs', role: 'tablist' });
        var tabUpload = el('button', { type: 'button', 'class': 'wysiwys-tab is-active' }, 'Envoyer un fichier');
        var tabServer = el('button', { type: 'button', 'class': 'wysiwys-tab' }, 'Choisir sur le serveur');
        tabs.appendChild(tabUpload);
        tabs.appendChild(tabServer);

        // Onglet envoi
        var panelUpload = el('div', { 'class': 'wysiwys-panel' });
        var drop = el('label', { 'class': 'wysiwys-dropzone' },
            icon('image') + '<span>Glisser une image ici ou <u>parcourir</u></span>');
        var file = el('input', { type: 'file', accept: 'image/*', hidden: '' });
        drop.appendChild(file);
        panelUpload.appendChild(drop);

        // Onglet serveur
        var panelServer = el('div', { 'class': 'wysiwys-panel', hidden: '' });
        var gallery = el('div', { 'class': 'wysiwys-gallery' });
        panelServer.appendChild(gallery);

        var status = el('p', { 'class': 'wysiwys-status' });
        var alt = el('input', { type: 'text', placeholder: 'Description de l’image (accessibilité)' });

        body.appendChild(tabs);
        body.appendChild(panelUpload);
        body.appendChild(panelServer);
        body.appendChild(status);
        body.appendChild(field('Texte alternatif', alt));

        var cancel = actionButton('Annuler');
        var ok = actionButton('Insérer', true);
        ok.disabled = true;
        var dialog = this.dialog('Insérer une image', body, [cancel, ok]);
        dialog.classList.add('is-large');

        function select(image) {
            selected = image;
            ok.disabled = !image;
            Array.prototype.forEach.call(gallery.querySelectorAll('.wysiwys-thumb'), function (item) {
                item.classList.toggle('is-selected', !!image && item.dataset.url === image.url);
            });
            status.textContent = image ? image.name : '';
        }

        function insert() {
            if (!selected) return;
            dialog.close();
            self.insertImage(selected.url, alt.value.trim());
        }

        function send(f) {
            if (!f) return;
            status.textContent = 'Envoi en cours…';
            status.classList.remove('is-error');
            ok.disabled = true;
            self.upload(f).then(function (image) {
                select(image);
                drop.querySelector('span').textContent = image.name;
                status.textContent = 'Image envoyée : ' + image.name;
                gallery.dataset.loaded = '';
            }).catch(function (error) {
                status.textContent = error.message;
                status.classList.add('is-error');
            });
        }

        function loadGallery() {
            if (gallery.dataset.loaded === '1') return;
            gallery.dataset.loaded = '1';
            gallery.innerHTML = '<p class="wysiwys-status">Chargement…</p>';
            self.request('GET', self.options.imagesUrl).then(function (data) {
                gallery.innerHTML = '';
                if (!data.images.length) {
                    gallery.innerHTML = '<p class="wysiwys-status">Aucune image sur le serveur.</p>';
                }
                data.images.forEach(function (image) {
                    var item = el('button', { type: 'button', 'class': 'wysiwys-thumb', title: image.name, 'data-url': image.url });
                    var img = el('img', { src: image.url, alt: '', loading: 'lazy' });
                    item.appendChild(img);
                    item.addEventListener('click', function () { select(image); });
                    item.addEventListener('dblclick', function () { select(image); insert(); });
                    var remove = el('button', {
                        type: 'button', 'class': 'wysiwys-thumb-delete',
                        title: 'Supprimer du serveur', 'aria-label': 'Supprimer ' + image.name
                    }, icon('trash'));
                    remove.addEventListener('click', function () { destroy(image, wrapper); });
                    var wrapper = el('div', { 'class': 'wysiwys-thumb-item' });
                    wrapper.appendChild(item);
                    wrapper.appendChild(remove);
                    gallery.appendChild(wrapper);
                });
                if (selected) select(selected);
            }).catch(function (error) {
                gallery.dataset.loaded = '';
                gallery.innerHTML = '';
                status.textContent = error.message;
                status.classList.add('is-error');
            });
        }

        function destroy(image, wrapper) {
            if (!window.confirm('Supprimer définitivement « ' + image.name + ' » du serveur ?\n' +
                'Les contenus qui l’utilisent afficheront une image cassée.')) return;
            status.classList.remove('is-error');
            self.request('DELETE', self.options.imagesUrl + '/' + encodeURIComponent(image.name)).then(function () {
                wrapper.remove();
                if (selected && selected.url === image.url) select(null);
                status.textContent = 'Image supprimée : ' + image.name;
                if (!gallery.querySelector('.wysiwys-thumb')) {
                    gallery.innerHTML = '<p class="wysiwys-status">Aucune image sur le serveur.</p>';
                }
            }).catch(function (error) {
                status.textContent = error.message;
                status.classList.add('is-error');
            });
        }

        function showTab(server) {
            tabUpload.classList.toggle('is-active', !server);
            tabServer.classList.toggle('is-active', server);
            panelUpload.hidden = server;
            panelServer.hidden = !server;
            if (server) loadGallery();
        }

        tabUpload.addEventListener('click', function () { showTab(false); });
        tabServer.addEventListener('click', function () { showTab(true); });
        file.addEventListener('change', function () { send(file.files[0]); });
        drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-over'); });
        drop.addEventListener('dragleave', function () { drop.classList.remove('is-over'); });
        drop.addEventListener('drop', function (e) {
            e.preventDefault();
            drop.classList.remove('is-over');
            send(e.dataTransfer.files[0]);
        });
        cancel.addEventListener('click', function () { dialog.close(); });
        ok.addEventListener('click', insert);
    };

    /* ----- Redimensionnement des images ----- */

    var HANDLES = ['nw', 'ne', 'sw', 'se'];
    var MIN_IMAGE_WIDTH = 24;

    Editor.prototype.buildImageFrame = function () {
        var self = this;
        var frame = el('div', { 'class': 'wysiwys-image-frame', hidden: '' });
        this.imageSize = el('span', { 'class': 'wysiwys-image-size' });
        frame.appendChild(this.imageSize);

        HANDLES.forEach(function (corner) {
            var handle = el('span', {
                'class': 'wysiwys-handle is-' + corner,
                title: 'Glisser pour redimensionner, double-clic pour la taille d’origine'
            });
            handle.addEventListener('pointerdown', function (e) { self.startImageResize(e, corner); });
            handle.addEventListener('dblclick', function () { self.resetImageSize(); });
            frame.appendChild(handle);
        });

        // Ne pas faire perdre le focus (et la sélection) à l'éditeur.
        frame.addEventListener('mousedown', function (e) { e.preventDefault(); });

        this.container.appendChild(frame);
        this.imageFrame = frame;
        this.buildImageToolbar();
    };

    /* ----- Barre contextuelle des images (alignement, texte alternatif) ----- */

    // Styles inline : le HTML produit s'affiche correctement sans la feuille de style de l'éditeur.
    var IMAGE_ALIGNS = [
        ['inline', 'imageInline', 'Dans le texte', {}],
        ['left', 'imageLeft', 'Habillage à gauche', { 'float': 'left', margin: '0.3em 1.5em 0.8em 0' }],
        ['center', 'imageCenter', 'Centrée, seule sur sa ligne', { display: 'block', margin: '0.8em auto' }],
        ['right', 'imageRight', 'Habillage à droite', { 'float': 'right', margin: '0.3em 0 0.8em 1.5em' }]
    ];

    Editor.prototype.buildImageToolbar = function () {
        var self = this;
        var bar = el('div', { 'class': 'wysiwys-image-toolbar', role: 'toolbar', 'aria-label': 'Image', hidden: '' });

        var view = el('div', { 'class': 'wysiwys-image-view' });
        var altButton = el('button', {
            type: 'button', 'class': 'wysiwys-btn wysiwys-alt-btn',
            title: 'Texte alternatif', 'aria-label': 'Texte alternatif'
        }, 'ALT');
        altButton.addEventListener('click', function () { self.openAltEditor(); });
        view.appendChild(altButton);
        view.appendChild(el('span', { 'class': 'wysiwys-image-sep' }));

        this.alignButtons = {};
        IMAGE_ALIGNS.forEach(function (align) {
            var button = el('button', {
                type: 'button', 'class': 'wysiwys-btn', title: align[2], 'aria-label': align[2]
            }, icon(align[1]));
            button.addEventListener('click', function () { self.alignImage(align[0]); });
            self.alignButtons[align[0]] = button;
            view.appendChild(button);
        });

        var form = el('div', { 'class': 'wysiwys-image-alt', hidden: '' });
        this.altInput = el('input', {
            type: 'text', 'class': 'wysiwys-alt-input', placeholder: 'Décrire l’image…',
            'aria-label': 'Texte alternatif'
        });
        var save = el('button', { type: 'button', 'class': 'wysiwys-btn', title: 'Valider', 'aria-label': 'Valider' }, icon('check'));
        var cancel = el('button', { type: 'button', 'class': 'wysiwys-btn', title: 'Annuler', 'aria-label': 'Annuler' }, icon('close'));
        save.addEventListener('click', function () { self.closeAltEditor(true); });
        cancel.addEventListener('click', function () { self.closeAltEditor(false); });
        this.altInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); self.closeAltEditor(true); }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); self.closeAltEditor(false); }
        });
        form.appendChild(this.altInput);
        form.appendChild(save);
        form.appendChild(cancel);

        bar.appendChild(view);
        bar.appendChild(form);

        // Les boutons ne doivent pas voler la sélection de l'image ; le champ, si.
        bar.addEventListener('mousedown', function (e) {
            if (e.target !== self.altInput) e.preventDefault();
        });

        this.container.appendChild(bar);
        this.imageToolbar = bar;
        this.imageToolbarView = view;
        this.imageToolbarAlt = form;
    };

    Editor.prototype.imageAlign = function (img) {
        if (img.style.float === 'left' || img.style.float === 'right') return img.style.float;
        return img.style.display === 'block' ? 'center' : 'inline';
    };

    // Largeur disponible pour l'image dans son bloc, marges latérales déduites.
    Editor.prototype.imageMaxWidth = function (img) {
        var block = closest(img.parentNode, 'p,h1,h2,h3,h4,h5,h6,blockquote,div,li', this.editable) || this.editable;
        var blockStyle = getComputedStyle(block);
        var width = block.clientWidth - parseFloat(blockStyle.paddingLeft) - parseFloat(blockStyle.paddingRight);
        if (this.imageAlign(img) !== 'center') {
            var imgStyle = getComputedStyle(img);
            width -= parseFloat(imgStyle.marginLeft) + parseFloat(imgStyle.marginRight);
        }
        return width;
    };

    Editor.prototype.alignImage = function (name) {
        if (!this.image) return;
        var img = this.image;
        ['float', 'display', 'margin'].forEach(function (property) { img.style.removeProperty(property); });
        IMAGE_ALIGNS.forEach(function (align) {
            if (align[0] !== name) return;
            Object.keys(align[3]).forEach(function (property) { img.style.setProperty(property, align[3][property]); });
        });
        if (!img.style.length) img.removeAttribute('style');
        // Les marges de l'habillage peuvent faire déborder une image pleine largeur.
        var maxWidth = Math.floor(this.imageMaxWidth(img));
        if (img.getBoundingClientRect().width > maxWidth) {
            img.removeAttribute('height');
            img.setAttribute('width', maxWidth);
        }
        this.positionImageFrame();
        this.sync();
    };

    Editor.prototype.openAltEditor = function () {
        if (!this.image) return;
        this.altInput.value = this.image.getAttribute('alt') || '';
        this.imageToolbarView.hidden = true;
        this.imageToolbarAlt.hidden = false;
        this.positionImageFrame();
        this.altInput.focus();
        this.altInput.select();
    };

    Editor.prototype.closeAltEditor = function (save) {
        var img = this.image;
        this.imageToolbarView.hidden = false;
        this.imageToolbarAlt.hidden = true;
        if (!img) return;
        if (save) {
            img.setAttribute('alt', this.altInput.value.trim());
            this.sync();
        }
        this.editable.focus();
        this.selectImage(img);
    };

    Editor.prototype.positionImageToolbar = function (box, rect) {
        var bar = this.imageToolbar;
        var align = this.imageAlign(this.image);
        Object.keys(this.alignButtons).forEach(function (name) {
            this.alignButtons[name].classList.toggle('is-active', name === align);
        }, this);
        this.imageToolbar.querySelector('.wysiwys-alt-btn')
            .classList.toggle('is-missing', !this.image.getAttribute('alt'));

        var gap = 8;
        var left = rect.left - box.left - this.container.clientLeft + (rect.width - bar.offsetWidth) / 2;
        left = Math.max(4, Math.min(left, this.container.clientWidth - bar.offsetWidth - 4));
        var top = rect.top - box.top - this.container.clientTop - bar.offsetHeight - gap;
        // Pas de place au-dessus (sous la barre d'outils principale) : on passe sous l'image.
        if (top < this.toolbar.offsetTop + this.toolbar.offsetHeight) {
            top = rect.bottom - box.top - this.container.clientTop + gap;
        }
        bar.style.left = left + 'px';
        bar.style.top = top + 'px';
    };

    Editor.prototype.selectImage = function (img) {
        this.image = img;
        var range = document.createRange();
        range.selectNode(img);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        this.range = range.cloneRange();
        this.container.classList.add('is-image-selected');
        this.imageFrame.hidden = false;
        this.imageToolbar.hidden = false;
        this.positionImageFrame();
    };

    Editor.prototype.deselectImage = function () {
        if (!this.image) return;
        this.image = null;
        this.container.classList.remove('is-image-selected');
        this.imageFrame.hidden = true;
        this.imageFrame.classList.remove('is-resizing');
        this.imageToolbar.hidden = true;
        this.imageToolbarView.hidden = false;
        this.imageToolbarAlt.hidden = true;
    };

    Editor.prototype.positionImageFrame = function () {
        if (!this.image) return;
        if (!this.editable.contains(this.image)) {
            this.deselectImage();
            return;
        }
        var box = this.container.getBoundingClientRect();
        var rect = this.image.getBoundingClientRect();
        var style = this.imageFrame.style;
        style.left = (rect.left - box.left - this.container.clientLeft) + 'px';
        style.top = (rect.top - box.top - this.container.clientTop) + 'px';
        style.width = rect.width + 'px';
        style.height = rect.height + 'px';
        this.imageSize.textContent = Math.round(rect.width) + ' × ' + Math.round(rect.height);
        this.positionImageToolbar(box, rect);
    };

    Editor.prototype.startImageResize = function (e, corner) {
        if (!this.image || e.button !== 0) return;
        e.preventDefault();

        var self = this;
        var img = this.image;
        var handle = e.currentTarget;
        var startX = e.clientX;
        var startWidth = img.getBoundingClientRect().width;
        var block = closest(img.parentNode, 'p,h1,h2,h3,h4,h5,h6,blockquote,div,li', this.editable) || this.editable;
        var blockStyle = getComputedStyle(block);
        var maxWidth = this.imageMaxWidth(img);
        // Une image centrée grandit des deux côtés : le pointeur ne parcourt que la moitié du chemin.
        var centered = this.imageAlign(img) === 'center' || (this.imageAlign(img) === 'inline' && blockStyle.textAlign === 'center');
        var factor = (corner === 'ne' || corner === 'se' ? 1 : -1) * (centered ? 2 : 1);

        img.removeAttribute('height');
        handle.setPointerCapture(e.pointerId);
        this.imageFrame.classList.add('is-resizing');

        function move(event) {
            var width = Math.round(startWidth + (event.clientX - startX) * factor);
            img.setAttribute('width', Math.max(MIN_IMAGE_WIDTH, Math.min(maxWidth, width)));
            self.positionImageFrame();
        }

        function stop() {
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
            self.imageFrame.classList.remove('is-resizing');
            self.sync();
        }

        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    };

    Editor.prototype.resetImageSize = function () {
        if (!this.image) return;
        this.image.removeAttribute('width');
        this.image.removeAttribute('height');
        this.positionImageFrame();
        this.sync();
    };

    /* ----- Collage et glisser-déposer ----- */

    Editor.prototype.uploadAndInsert = function (files) {
        var self = this;
        Array.prototype.forEach.call(files, function (f) {
            if (!/^image\//.test(f.type)) return;
            self.upload(f).then(function (image) {
                self.insertImage(image.url, '');
            }).catch(function (error) {
                window.alert(error.message);
            });
        });
    };

    Editor.prototype.onPaste = function (e) {
        var data = e.clipboardData;
        if (!data) return;

        if (data.files && data.files.length) {
            e.preventDefault();
            this.uploadAndInsert(data.files);
            return;
        }

        e.preventDefault();
        var html = data.getData('text/html');
        if (html) {
            this.insertHtml(clean(html));
        } else {
            var text = data.getData('text/plain');
            this.insertHtml(escapeHtml(text).replace(/\r?\n/g, '<br>'));
        }
    };

    Editor.prototype.onDrop = function (e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
            e.preventDefault();
            if (document.caretRangeFromPoint) {
                this.range = document.caretRangeFromPoint(e.clientX, e.clientY);
            }
            this.uploadAndInsert(e.dataTransfer.files);
        }
    };

    /* ----- Aperçu et plein écran ----- */

    Editor.prototype.openPreview = function () {
        var body = el('div', { 'class': 'wysiwys-content wysiwys-preview' }, clean(this.getHtml()) ||
            '<p class="wysiwys-status">Le contenu est vide.</p>');
        var dialog = this.dialog('Aperçu', body);
        dialog.classList.add('is-wide');
    };

    Editor.prototype.toggleFullscreen = function () {
        var on = this.container.classList.toggle('is-fullscreen');
        document.documentElement.classList.toggle('wysiwys-lock', on);
        if (this.buttons.fullscreen) {
            this.buttons.fullscreen.innerHTML = icon(on ? 'exitFullscreen' : 'fullscreen');
            this.buttons.fullscreen.classList.toggle('is-active', on);
        }
        this.restoreSelection();
    };

    /* ------------------------------------------------------------------ */
    /* Démarrage                                                           */
    /* ------------------------------------------------------------------ */

    function init(root) {
        Array.prototype.forEach.call((root || document).querySelectorAll('[data-wysiwys]'), function (container) {
            if (!container.wysiwys) new Editor(container);
        });
    }

    window.Wysiwys = { init: init, clean: clean, Editor: Editor };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
        init();
    }
})();
