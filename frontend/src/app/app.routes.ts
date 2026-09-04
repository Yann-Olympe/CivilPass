import { Routes } from '@angular/router';
import { citizenAuthGuard } from './core/guards/citizen-auth.guard';
import { agentAuthGuard } from './core/guards/agent-auth.guard';
import { CitizenShell } from './features/citizen/layout/citizen-shell/citizen-shell';
import { Shell } from './features/mairie/layout/shell/shell';
import { Dashboard } from './features/mairie/pages/dashboard/dashboard';
import { DemandesList } from './features/mairie/pages/demandes-list/demandes-list';
import { Verification } from './features/mairie/pages/verification/verification';
import { TransfertsList } from './features/mairie/pages/transferts-list/transferts-list';
import { TransfertDetail } from './features/mairie/pages/transfert-detail/transfert-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // ===== Partie citoyen =====
  {
    path: 'inscription',
    children: [
      { path: 'identite', loadComponent: () => import('./features/Auth/pages/register-wizard/register-identite/register-identite').then(m => m.RegisterIdentite) },
      { path: 'coordonnees', loadComponent: () => import('./features/Auth/pages/register-wizard/register-coordonnees/register-coordonnees').then(m => m.RegisterCoordonnees) },
      { path: 'securite', loadComponent: () => import('./features/Auth/pages/register-wizard/register-securite/register-securite').then(m => m.RegisterSecurite) },
      { path: 'piece-identite', loadComponent: () => import('./features/Auth/pages/register-wizard/register-piece-identite/register-piece-identite').then(m => m.RegisterPieceIdentite) },
      { path: 'recapitulatif', loadComponent: () => import('./features/Auth/pages/register-wizard/register-recapitulatif/register-recapitulatif').then(m => m.RegisterRecapitulatif) },
      { path: '', redirectTo: 'identite', pathMatch: 'full' },
    ],
  },
        { path: 'login', loadComponent: () => import('./features/Auth/pages/login/login').then(m => m.Login) },

  {
    path: '',
    component: CitizenShell,
    children: [
      { path: 'accueil', loadComponent: () => import('./features/citizen/accueil/accueil').then(m => m.Accueil) },
      { path: 'demande/identite', loadComponent: () => import('./features/citizen/demande/identite/identite').then(m => m.Identite) },
      { path: 'demande/acte', loadComponent: () => import('./features/citizen/demande/acte/acte').then(m => m.Acte) },
      { path: 'demande/mairie', loadComponent: () => import('./features/citizen/demande/mairie/mairie').then(m => m.Mairie) },
      { path: 'demande/validation', loadComponent: () => import('./features/citizen/demande/validation/validation').then(m => m.Validation) },
      {
        path: '',
        children: [],
      },
    ],
  },

  // ===== Espace citoyen connecté ("Dashbord client") =====
  {
    path: 'espace',
    canActivate: [citizenAuthGuard],
    loadComponent: () =>
      import('./features/Dashbord client/layout/client-shell/client-shell').then(m => m.ClientShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/Dashbord client/pages/espace-home/espace-home').then(m => m.EspaceHome),
      },
      {
        path: 'demandes',
        loadComponent: () =>
          import('./features/Dashbord client/pages/mes-demandes/mes-demandes').then(m => m.MesDemandes),
      },
      {
        path: 'demandes/:id',
        loadComponent: () =>
          import('./features/Dashbord client/pages/demande-detail/demande-detail').then(m => m.DemandeDetail),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/Dashbord client/pages/mon-profil/mon-profil').then(m => m.MonProfil),
      },
      {
        path: 'statistiques',
        loadComponent: () =>
          import('./features/Dashbord client/pages/statistiques/statistiques').then(m => m.Statistiques),
      },
      { path: '**', redirectTo: '' },
    ],
  },

  // ===== Partie de ton collègue (mairie), préfixée =====
  {
    path: 'mairie',
    children: [
      // Connexion : HORS du Shell, accessible sans être connecté
      { path: 'connexion', loadComponent: () => import('./features/mairie/auth/login/login').then(m => m.MairieLogin) },

      // Tout le reste : DANS le Shell, protégé par le guard
      {
        path: '',
        component: Shell,
        canActivate: [agentAuthGuard],
        children: [
          { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
          { path: 'tableau-de-bord', component: Dashboard },
          { path: 'demandes', component: DemandesList, data: { statut: 'all' } },
          { path: 'en-cours', component: DemandesList, data: { statut: 'en_cours' } },
          { path: 'validees', component: DemandesList, data: { statut: 'validee' } },
          { path: 'rejetees', component: DemandesList, data: { statut: 'rejetee' } },
          { path: 'demandes/:id', component: Verification },
          { path: 'transferts', component: TransfertsList },
          { path: 'transferts/:id', component: TransfertDetail },
          { path: '**', redirectTo: 'tableau-de-bord' },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'accueil' },
];