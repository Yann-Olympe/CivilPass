# CivilPass Cameroun — Backend (Laravel API)

Backend REST pour le MVP CivilPass Cameroun — ATL2026, Orange Digital Center Douala.
Couvre le pré-enrôlement (acte de naissance) et le service inter-Mairies simulé (Volet 2).

## 1. Stack

- **Laravel** (API REST) — PHP 8.2+
- **Base de données** : MySQL 8+ (schéma fourni dans `database/schema.sql`) — adaptable PostgreSQL
- **Auth agents** : Laravel Sanctum (token API)
- **PDF** : `barryvdh/laravel-dompdf`
- **QR Code** : `simplesoftwareio/simple-qrcode`

## 2. Installation

```bash
composer create-project laravel/laravel civilpass-backend
cd civilpass-backend
composer require laravel/sanctum barryvdh/laravel-dompdf simplesoftwareio/simple-qrcode

php artisan install:api   # publie la config Sanctum
```

Copiez ensuite les dossiers `app/Models`, `app/Http/Controllers/Api`, `database/migrations`
et le fichier `routes/api.php` de ce livrable dans le projet Laravel fraîchement créé
(ils sont prêts à l'emploi, aucune modification nécessaire).

Dans `app/Models/Agent.php`, assurez-vous que le guard `agent` (ou `sanctum`) pointe
bien vers ce modèle si vous utilisez plusieurs guards d'authentification.

## 3. Configuration `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civilpass
DB_USERNAME=root
DB_PASSWORD=
```

## 4. Base de données

Deux options équivalentes :

**Option A — via les migrations Laravel (recommandé) :**
```bash
php artisan migrate
```

**Option B — script SQL direct** (utile pour une démo rapide sans backend complet) :
```bash
mysql -u root -p < database/schema.sql
```

Le script SQL insère aussi 2 Mairies de démo (Douala 3e / Yaoundé 1er) pour tester
immédiatement le service inter-Mairies.

Pensez à créer au moins un agent par Mairie (via un `seeder` ou `php artisan tinker`) :
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
| `agents` | Comptes des agents d'état civil (authentifiés, rattachés à une Mairie + un rôle) |
| `usagers` | Le citoyen — authentifié par téléphone + mot de passe (Sanctum) |
| `demandes` | Le dossier — statut, Mairie d'origine/retrait, numéro d'acte, résultat souche, QR token |
| `filiations` | Nom du père / de la mère, liés à une demande de naissance |
| `transferts` | Suivi du transfert inter-Mairies (dates de validation / réception) |
| `notifications` | Alertes dashboard mairie (`dossier_transfere`, `dossier_recu`) |

> Deux guards Sanctum coexistent sur le même mécanisme de tokens : `Agent` et `Usager` sont chacun
> `Authenticatable` + `HasApiTokens`. `auth:sanctum` résout automatiquement le bon modèle
> selon le token présenté — aucune config de guard supplémentaire n'est nécessaire.

Cycle de statut d'une `demande` (Parcours B) :
```
en_attente_validation_origine → validee_origine → transferee → disponible_retrait → remise
```

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
| POST | `/api/citoyen/register` | `{ nom, prenom, telephone, password, password_confirmation }` → token |
| POST | `/api/citoyen/login` | `{ telephone, password }` → token |
| GET | `/api/citoyen/me` | Profil du citoyen connecté *(protégé)* |
| POST | `/api/citoyen/logout` | Révoque le token *(protégé)* |
| GET | `/api/citoyen/demandes` | Historique / suivi des demandes du citoyen *(protégé)* |

### Demande (citoyen connecté requis)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/demandes` | Crée la demande + la filiation pour le citoyen authentifié *(protégé)* |

**Body attendu pour `POST /api/demandes` (en-tête `Authorization: Bearer {token citoyen}`) :**
```json
{
  "mairie_origine_id": 1,
  "mairie_retrait_id": 2,
  "numero_acte": "2010/145",
  "annee_acte": 2010,
  "filiation": { "pere_nom": "Mbarga Jean", "mere_nom": "Eyenga Marie" }
}
```
L'identité de l'usager n'est plus envoyée dans le body : elle est déduite du token (`$request->user()`).

### Authentification agent

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | `{ "email": "...", "password": "..." }` → token Sanctum |
| GET | `/api/agent/me` | Profil de l'agent connecté |
| POST | `/api/agent/logout` | Révoque le token courant |

Toutes les routes `/api/agent/*` suivantes nécessitent l'en-tête :
`Authorization: Bearer {token}`

### Espace agent de mairie (protégé)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/agent/demandes` | Dossiers filtrés selon la Mairie et le rôle de l'agent |
| GET | `/api/agent/demandes/{id}` | Détail d'un dossier |
| POST | `/api/agent/demandes/{id}/valider` | Agent origine : enregistre le résultat souche et déclenche le transfert |
| POST | `/api/agent/demandes/{id}/recevoir` | Agent retrait : confirme la réception (notifie la Mairie d'origine) |
| POST | `/api/agent/demandes/{id}/remettre` | Agent retrait : remet l'acte au citoyen |
| POST | `/api/agent/scan` | `{ "qr_token": "..." }` → récupère le dossier scanné |
| GET | `/api/agent/notifications` | Notifications de la Mairie de l'agent (`?lue=0` pour le badge) |
| PATCH | `/api/agent/notifications/{id}/lue` | Marque une notification comme lue |

**Body attendu pour `POST /api/agent/demandes/{id}/valider` :**
```json
{ "souche_retrouvee": true, "observation_origine": "Acte conforme, souche vérifiée." }
```
Si `souche_retrouvee` est `false`, la demande est mise à jour mais **pas transférée** (le dossier reste bloqué avec l'observation saisie) — règle provisoire, à confirmer en équipe (point ouvert du doc archi).

## 8. Points à trancher en équipe

- **Choix final SGBD** : MySQL (par défaut ici) ou PostgreSQL — le script `schema.sql`
  est écrit en MySQL ; portage PostgreSQL trivial si besoin (types `ENUM` → `VARCHAR` + `CHECK`).
- **CORS** : configurer `config/cors.php` pour autoriser l'origine du frontend Angular
  (`http://localhost:4200` en dev).
- **Règle "souche introuvable"** : actuellement le backend bloque le dossier sans le transférer
  et renvoie un `422` avec l'observation saisie — à confirmer (rejet définitif ? renvoi au citoyen ?
  nouvelle tentative ?).
- **Notifications temps réel** : le MVP actuel est en *polling* (`GET /api/agent/notifications`
  interrogé périodiquement par le Frontend). Passage à WebSocket (Laravel Reverb/Pusher) possible
  plus tard sans changer le modèle de données.
- **Rôles agents détaillés** : le rôle `Agent::role` (`origine` / `retrait` / `les_deux`) couvre
  le MVP ; à affiner si des droits plus fins sont nécessaires par mairie.

## 9. Convention de commits (backend)

```
feat(api): ajoute l'endpoint de validation Mairie d'origine
fix(demandes): corrige le calcul du statut après réception
docs(readme): documente le contrat d'API
chore(migrations): ajoute la table transferts
```
