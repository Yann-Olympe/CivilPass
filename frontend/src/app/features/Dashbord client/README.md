# Dashbord client — Espace citoyen connecté

Ce dossier contient **tout** ce qui est nécessaire pour l'espace citoyen connecté
(« Mon espace », « Mes demandes », « Mon profil », statistiques) — sans rien
modifier au reste du projet.

## Où c'est branché

Une seule modification a été faite hors de ce dossier : l'ajout du bloc de routes
`{ path: 'espace', ... }` dans `src/app/app.routes.ts` (juste après le bloc du
citoyen public). Rien d'autre n'a été touché.

Le header public (`features/citizen/layout/citizen-shell/components/header`)
pointe déjà vers `/espace` et `/espace/demandes` quand l'utilisateur est
connecté (`CitizenAuthService.isLoggedIn()`) — c'est donc directement
opérationnel.

## Pages / routes

| Route                    | Composant         | Description                                   |
|---------------------------|-------------------|------------------------------------------------|
| `/espace`                  | `EspaceHome`      | Tableau de bord (« Mon espace »)               |
| `/espace/demandes`         | `MesDemandes`     | Historique des demandes (recherche + filtres)  |
| `/espace/demandes/:id`     | `DemandeDetail`   | Détail + suivi + actions d'une demande         |
| `/espace/profil`           | `MonProfil`       | Consultation / modification du profil          |
| `/espace/statistiques`     | `Statistiques`    | Visualisation analytique (graphiques)          |

Toutes ces routes sont protégées par `citizenAuthGuard` (déjà existant dans
`core/guards/`).

## Données de test & services simulés

- `shared/data/demandes-client.mock.ts` — 14 demandes de test
- `shared/data/user-client.mock.ts` — profil citoyen de test
- `shared/services/client-demandes.service.ts` — store signals (stats, recherche,
  filtres, confirmation de retrait) — **à remplacer par de vrais appels HTTP**
  quand l'API sera prête (voir les commentaires `TODO(API)`)
- `shared/services/client-user.service.ts` — lecture/mise à jour du profil (simulée)
- `shared/services/client-support.service.ts` — envoi d'un message au support (simulé)

## Actions branchées (chaque bouton visible fait quelque chose)

- **Voir les détails** (bannière « prêt ») → navigue vers le détail de la demande
- **Cartes de stats** (Mon espace) → filtrent et ouvrent « Mes demandes »
- **Visualisation Analytique** → ouvre la page Statistiques
- **Nouvelle demande / Voir mes demandes / Mon profil** (actions rapides) → navigation
- **Recherche + onglets** (Mes demandes) → filtrent la liste en direct
- **Clic sur une demande** → ouvre le détail
- **Confirmer le retrait** (détail, statut "Prêt") → modale de confirmation puis
  mise à jour du statut + notification
- **Télécharger le récépissé** → génère et télécharge un vrai fichier `.txt`
- **Modifier** (Mon profil) → formulaire réactif complet, validation, sauvegarde
  simulée puis retour à la vue avec les données mises à jour
- **Contacter le support** (barre latérale) → formulaire modal, envoi simulé,
  notification de confirmation
- **Avatar / menu déroulant** → Mon profil / Déconnexion
- **Globe** → bascule FR/EN (cosmétique, comme le header public existant)

## Remarque technique

Le nom de dossier contient volontairement un espace (`Dashbord client`), comme
demandé. Cela fonctionne avec les imports relatifs TypeScript/Angular, mais si
votre outillage (CI, Git sur certains OS) pose problème avec les espaces dans
les chemins, il suffit de renommer le dossier en `Dashbord-client` et de
mettre à jour les 5 imports dynamiques dans `app.routes.ts` en conséquence.
