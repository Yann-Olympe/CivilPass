<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Récapitulatif CivilPass #{{ $demande->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; color: #333; }
        .header { border-bottom: 2px solid #e65100; padding-bottom: 10px; margin-bottom: 20px; }
        .badge { display: inline-block; background: #fff3e0; color: #e65100; padding: 4px 10px; border-radius: 4px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        td { padding: 6px 8px; vertical-align: top; }
        td.label { width: 40%; font-weight: bold; color: #555; }
        .qr { text-align: center; margin-top: 24px; }
        .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CivilPass — Récapitulatif de demande</h1>
        <span class="badge">{{ strtoupper(str_replace('_', ' ', $demande->statut)) }}</span>
    </div>

    <h2>Usager</h2>
    <table>
        <tr><td class="label">Nom complet</td><td>{{ $demande->usager->prenom }} {{ $demande->usager->nom }}</td></tr>
        <tr><td class="label">Téléphone</td><td>{{ $demande->usager->telephone }}</td></tr>
    </table>

    <h2>Démarche</h2>
    <table>
        <tr><td class="label">Type</td><td>{{ ucfirst($demande->type_demande) }}</td></tr>
        <tr><td class="label">N° acte</td><td>{{ $demande->numero_acte ?? '—' }}</td></tr>
        <tr><td class="label">Année acte</td><td>{{ $demande->annee_acte ?? '—' }}</td></tr>
        <tr><td class="label">Mairie d'origine</td><td>{{ $demande->mairieOrigine->nom }} ({{ $demande->mairieOrigine->ville }})</td></tr>
        <tr><td class="label">Mairie de retrait</td><td>{{ $demande->mairieRetrait->nom }} ({{ $demande->mairieRetrait->ville }})</td></tr>
        <tr><td class="label">Date de création</td><td>{{ $demande->date_creation->format('d/m/Y H:i') }}</td></tr>
    </table>

    @if ($demande->filiation)
    <h2>Filiation</h2>
    <table>
        <tr><td class="label">Père</td><td>{{ $demande->filiation->pere_nom ?? '—' }}</td></tr>
        <tr><td class="label">Mère</td><td>{{ $demande->filiation->mere_nom ?? '—' }}</td></tr>
    </table>
    @endif

    <div class="qr">
        <p><strong>QR Code de suivi</strong></p>
        <img src="data:image/svg+xml;base64,{{ base64_encode($qrSvg) }}" width="160" height="160" alt="QR Code">
        <p style="font-size: 10px; color: #666;">{{ $demande->qr_token }}</p>
    </div>

    <div class="footer">
        CivilPass Cameroun — ATL2026 Orange Digital Center Douala
    </div>
</body>
</html>
