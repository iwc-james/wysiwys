<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wysiwys — démo</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 960px; margin: 32px auto; padding: 0 16px; color: #1e293b; }
        button[type=submit] { margin-top: 12px; padding: 8px 18px; }
        pre { white-space: pre-wrap; background: #f1f5f9; padding: 12px; border-radius: 6px; }
    </style>
</head>
<body>
    <h1>Wysiwys — démo</h1>

    <form method="post">
        @csrf
        <x-wysiwys name="body" :value="$body" placeholder="Commencez à écrire…" />
        <button type="submit">Enregistrer</button>
    </form>

    @if ($submitted)
        <h2>HTML reçu (nettoyé)</h2>
        <pre>{{ $body }}</pre>
        <h2>Rendu</h2>
        <div class="wysiwys-content">{!! $body !!}</div>
    @endif
</body>
</html>
