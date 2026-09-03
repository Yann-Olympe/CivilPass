# CivilPass Cameroun — Backend (Laravel API)

Backend REST pour le MVP CivilPass Cameroun — ATL2026, Orange Digital Center Douala.
Couvre le pré-enrôlement (acte de naissance), le service inter-Mairies simulé, et l'authentification
citoyen avec identité complète + NUI + CNI recto/verso.

## 1. Stack

- **Laravel** (API REST) — PHP 8.2+
- **Base de données** : MySQL 8+ (schéma fourni dans `database/schema.sql`) — adaptable PostgreSQL
- **Auth agents et citoyens** : Laravel Sanctum (token API)

- **PDF** : `barryvdh/laravel-dompdf`
- **QR Code** : `simplesoftwareio/simple-qrcode`
- **Stockage fichiers** (photos CNI) : disque `public` Laravel

## 2. Installation

```bash
composer create-project laravel/laravel civilpass-backend
cd civilpass-backend
composer require laravel/sanctum barryvdh/laravel-dompdf simplesoftwareio/simple-qrcode doctrine/dbal

php artisan install:api
```

Copiez les dossiers `app/Models`, `app/Http/Controllers/Api`, `database/migrations`
et le fichier `routes/api.php` de ce livrable dans le projet Laravel.

## 3. Configuration `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civilpass
DB_USERNAME=root
DB_PASSWORD=

## 4. Base de données et stockage

```bash
php artisan migrate
php artisan storage:link   # indispensable : rend accessibles les photos CNI uploadées
```

Ou via le script SQL direct (`database/schema.sql`) — insère aussi 2 Mairies de démo.

Créez au moins un agent par Mairie :
```php
\App\Models\Agent::create([
    'nom' => 'Agent Douala',
    'email' => 'agent.douala@civilpass.test',
    'password' => bcrypt('password'),
    'mairie_id' => 1,
    'role' => 'origine',
]);
```

## 5. Lancer le serveur

```bash
php artisan serve
# API disponible sur http://127.0.0.1:8000/api
```

## 6. Modèle de données

| Table | Rôle |
|---|---|
| `mairies` | Les deux Mairies simulées (origine / retrait) |
| `agents` | Comptes des agents d'état civil (rattachés à une Mairie + un rôle) |
| `usagers` | Le citoyen — identité complète, NUI, CNI recto/verso, auth (téléphone/mdp) |
| `demandes` | Le dossier — statut, Mairie d'origine/retrait, numéro d'acte, résultat souche, QR token |
| `filiations` | Nom du père / de la mère, liés à une demande de naissance |
| `transferts` | Suivi du transfert inter-Mairies (dates de validation / réception) |
| `notifications` | Alertes dashboard mairie (`dossier_transfere`, `dossier_recu`) |

> Deux guards Sanctum coexistent : `Agent` et `Usager` sont chacun `Authenticatable` + `HasApiTokens`.
> `auth:sanctum` résout automatiquement le bon modèle selon le token présenté.

### Champs `usagers` (inscription citoyen)

| Groupe | Champs |
|---|---|
| Identité | `prenom`, `nom`, `date_naissance`, `lieu_naissance`, `sexe`, `nationalite` |
| Coordonnées | `email`, `telephone`, `adresse`, `ville`, `region` |
| Identification (optionnelle à l'inscription) | `nui`, `cni_numero`, `cni_recto_path`, `cni_verso_path` |

## 7. Contrat d'API — endpoints

### Public (sans authentification)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/mairies` | Liste des Mairies pour le formulaire de sélection |
| GET | `/api/checklist/{type_demande}` | Checklist dynamique des pièces requises |
| GET | `/api/demandes/{qr_token}` | Récapitulatif du dossier (suivi) |
| GET | `/api/demandes/{qr_token}/pdf` | Télécharge le récapitulatif PDF + QR Code |

### Authentification citoyen

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/citoyen/login` | `{ telephone, password }` → token |
| GET | `/api/citoyen/me` | Profil du citoyen connecté *(protégé)* |
| POST | `/api/citoyen/logout` | Révoque le token *(protégé)* |
| GET | `/api/citoyen/demandes` | Historique / suivi des demandes *(protégé)* |



### Demande (citoyen connecté requis)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/demandes` | Crée la demande + la filiation pour le citoyen authentifié *(protégé)* |

```json
{
  "mairie_origine_id": 1,
  "mairie_retrait_id": 2,
  "numero_acte": "2010/145",
  "annee_acte": 2010,
  "filiation": { "pere_nom": "Mbarga Jean", "mere_nom": "Eyenga Marie" }
}
```

### Authentification agent

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → token |
| GET | `/api/agent/me` | Profil de l'agent connecté *(protégé)* |
| POST | `/api/agent/logout` | Révoque le token *(protégé)* |

### Espace agent de mairie (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/agent/demandes` | Dossiers filtrés selon la Mairie et le rôle de l'agent |
| GET | `/api/agent/demandes/{id}` | Détail d'un dossier |
| POST | `/api/agent/demandes/{id}/valider` | `{ souche_retrouvee, observation_origine }` → transfert |
| POST | `/api/agent/demandes/{id}/recevoir` | Confirme la réception (notifie la Mairie d'origine) |
| POST | `/api/agent/demandes/{id}/remettre` | Remet l'acte au citoyen |
| POST | `/api/agent/scan` | `{ qr_token }` → récupère le dossier scanné |
| GET | `/api/agent/notifications` | Notifications de la Mairie (`?lue=0` pour le badge) |
| PATCH | `/api/agent/notifications/{id}/lue` | Marque une notification comme lue |

## 8. Points à trancher en équipe

- **Choix final SGBD** : MySQL (par défaut) ou PostgreSQL.
- **CORS** : `config/cors.php` doit autoriser précisément votre domaine Vercel de prod
  et un pattern regex pour les previews (`allowed_origins_patterns`).
- **Règle "souche introuvable"** : le backend bloque actuellement le dossier sans transfert (`422`) —
  à confirmer (rejet définitif ? nouvelle tentative ?).
- **Notifications temps réel** : MVP en *polling* — passage WebSocket possible plus tard.

- **Confidentialité des photos CNI** : actuellement stockées sur le disque `public` (accessibles par URL
  directe si on connaît le chemin). Pour un usage réel, envisager le disque `private` + un endpoint
  signé/protégé pour la consultation par les agents habilités uniquement.

## 9. Convention de commits (backend)

```
feat(api): ajoute l'endpoint de validation Mairie d'origine
feat(auth): ajoute l'inscription citoyen avec NUI et upload CNI
fix(demandes): corrige le calcul du statut après réception
docs(readme): documente le contrat d'API
chore(migrations): ajoute la table notifications
```
