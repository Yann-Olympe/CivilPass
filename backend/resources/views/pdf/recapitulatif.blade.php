<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Récépissé CivilPass #{{ $demande->id }}</title>
    <style>
        @page { margin: 34px 42px 48px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #18303b; font-family: DejaVu Sans, sans-serif; font-size: 10px; line-height: 1.5; }
        .topline { height: 5px; background: #e56b32; margin: -34px -42px 24px; }
        .brand { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .brand td { vertical-align: middle; }
        .brand-name { color: #123b4a; font-size: 19px; font-weight: bold; letter-spacing: .4px; }
        .brand-name span { color: #e56b32; }
        .brand-note { color: #72838a; font-size: 8px; text-align: right; text-transform: uppercase; letter-spacing: 1px; }
        .hero { background: #123b4a; color: #fff; padding: 19px 21px; border-radius: 8px; margin-bottom: 18px; }
        .hero-kicker { color: #b8d2d8; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 5px; }
        .hero-title { color: #fff; font-size: 19px; margin: 0 0 11px; }
        .hero-meta { color: #e5eff1; font-size: 9px; }
        .status { display: inline-block; background: #eaf5f2; color: #19705d; padding: 4px 9px; border-radius: 10px; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: .5px; }
        .section { margin: 17px 0 0; page-break-inside: avoid; }
        .section-title { color: #123b4a; font-size: 11px; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 1px solid #dce6e8; }
        .section-index { color: #e56b32; font-size: 8px; margin-right: 7px; }
        .details { width: 100%; border-collapse: collapse; }
        .details tr:nth-child(odd) { background: #f5f8f8; }
        .details td { padding: 7px 9px; vertical-align: top; }
        .details .label { width: 34%; color: #72838a; font-size: 8px; text-transform: uppercase; letter-spacing: .35px; }
        .details .value { color: #18303b; font-size: 9px; font-weight: bold; }
        .route { width: 100%; border-collapse: collapse; margin-top: 3px; }
        .route td { width: 50%; vertical-align: top; padding: 10px 12px; background: #f5f8f8; border-left: 3px solid #e56b32; }
        .route td + td { border-left-color: #2a8c78; }
        .route-label { color: #72838a; font-size: 8px; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
        .route-name { color: #18303b; font-size: 10px; font-weight: bold; }
        .route-city { color: #72838a; font-size: 9px; }
        .qr-panel { width: 100%; border-collapse: collapse; margin-top: 19px; background: #f5f8f8; page-break-inside: avoid; }
        .qr-panel td { vertical-align: middle; padding: 12px 14px; }
        .qr-image { width: 112px; text-align: center; }
        .qr-image img { width: 96px; height: 96px; }
        .qr-title { color: #123b4a; font-size: 11px; font-weight: bold; margin-bottom: 4px; }
        .qr-copy { color: #60747c; font-size: 8px; }
        .token { color: #18303b; font-size: 7px; margin-top: 7px; word-break: break-all; }
        .notice { color: #72838a; font-size: 8px; margin-top: 12px; text-align: center; }
        .footer { position: fixed; bottom: -30px; left: 0; right: 0; border-top: 1px solid #dce6e8; padding-top: 8px; color: #829197; font-size: 7px; }
        .footer table { width: 100%; border-collapse: collapse; }
        .footer .right { text-align: right; }
    </style>
</head>
<body>
    <div class="topline"></div>
    <table class="brand"><tr>
        <td class="brand-name">Civil<span>Pass</span></td>
        <td class="brand-note">Service de suivi des actes d’état civil<br>Cameroun</td>
    </tr></table>

    <div class="hero">
        <p class="hero-kicker">Récépissé de suivi</p>
        <h1 class="hero-title">Demande de {{ strtolower($demande->type_demande) }}</h1>
        <div class="hero-meta">Référence <strong>CP-{{ str_pad((string) $demande->id, 6, '0', STR_PAD_LEFT) }}</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp; Créée le {{ $demande->date_creation->format('d/m/Y à H:i') }}</div>
        <div style="margin-top: 11px"><span class="status">{{ str_replace('_', ' ', $demande->statut) }}</span></div>
    </div>

    <div class="section">
        <h2 class="section-title"><span class="section-index">01</span>Identité du demandeur</h2>
        <table class="details">
            <tr><td class="label">Nom complet</td><td class="value">{{ $demande->usager->prenom }} {{ $demande->usager->nom }}</td></tr>
            <tr><td class="label">Téléphone</td><td class="value">{{ $demande->usager->telephone }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title"><span class="section-index">02</span>Informations sur l’acte</h2>
        <table class="details">
            <tr><td class="label">Numéro d’acte</td><td class="value">{{ $demande->numero_acte ?? 'Non renseigné' }}</td></tr>
            <tr><td class="label">Année de l’acte</td><td class="value">{{ $demande->annee_acte ?? 'Non renseignée' }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title"><span class="section-index">03</span>Parcours de la demande</h2>
        <table class="route"><tr>
            <td><div class="route-label">Mairie d’origine</div><div class="route-name">{{ $demande->mairieOrigine->nom }}</div><div class="route-city">{{ $demande->mairieOrigine->ville }}</div></td>
            <td><div class="route-label">Mairie de retrait</div><div class="route-name">{{ $demande->mairieRetrait->nom }}</div><div class="route-city">{{ $demande->mairieRetrait->ville }}</div></td>
        </tr></table>
    </div>

    @if ($demande->filiation)
    <div class="section">
        <h2 class="section-title"><span class="section-index">04</span>Filiation déclarée</h2>
        <table class="details">
            <tr><td class="label">Père</td><td class="value">{{ $demande->filiation->pere_nom ?? 'Non renseigné' }}</td></tr>
            <tr><td class="label">Mère</td><td class="value">{{ $demande->filiation->mere_nom ?? 'Non renseignée' }}</td></tr>
        </table>
    </div>
    @endif

    <table class="qr-panel"><tr>
        <td class="qr-image"><img src="data:image/svg+xml;base64,{{ base64_encode($qrSvg) }}" alt="QR code de suivi"></td>
        <td>
            <div class="qr-title">Suivez l’état de votre dossier</div>
            <div class="qr-copy">Présentez ce QR code à une mairie CivilPass pour retrouver rapidement votre demande.</div>
            <div class="token">Code de suivi : {{ $demande->qr_token }}</div>
        </td>
    </tr></table>

    <p class="notice">Ce document est un récépissé de suivi. Il ne constitue pas un acte d’état civil officiel.</p>

    <div class="footer"><table><tr>
        <td>CivilPass Cameroun · ATL2026 · Orange Digital Center Douala</td>
        <td class="right">Document généré le {{ now()->format('d/m/Y à H:i') }}</td>
    </tr></table></div>
</body>
</html>
