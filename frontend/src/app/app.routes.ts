import { Routes } from '@angular/router';
import { citizenAuthGuard } from './core/guards/citizen-auth.guard';
import { CitizenShell } from './features/citizen/layout/citizen-shell/citizen-shell';
import { Shell } from './features/mairie/layout/shell/shell';
import { Dashboard } from './features/mairie/pages/dashboard/dashboard';
import { DemandesList } from './features/mairie/pages/demandes-list/demandes-list';
import { Verification } from './features/mairie/pages/verification/verification';
import { TransfertsList } from './features/mairie/pages/transferts-list/transferts-list';
import { TransfertDetail } from './features/mairie/pages/transfert-detail/transfert-detail';

export const routes: Routes = [
  // ===== Racine : redirige vers TA partie (citoyen) =====
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // ===== Ta partie (citoyen) =====
  
   // app.routes.ts
{
  path: '',
  component: CitizenShell,
  children: [
    // --- Routes publiques ---
    { path: 'accueil', loadComponent: () => import('./features/citizen/accueil/accueil').then(m => m.Accueil) },

     // --- Parcours "Nouvelle Demande" (3 étapes, public pour l'instant) ---
    { path:'demande/identite',loadComponent:() => import('./features/citizen/demande/identite/identite').then(m => m.Identite)},
    { path:'demande/acte',loadComponent:() => import('./features/citizen/demande/acte/acte').then(m => m.Acte)},
    { path: 'demande/mairie', loadComponent: () => import('./features/citizen/demande/mairie/mairie').then(m => m.Mairie) },
    { path: 'demande/validation', loadComponent: () => import('./features/citizen/demande/validation/validation').then(m => m.Validation) },

    { path: 'login', loadComponent: () => import('./features/Auth/pages/login/login').then(m => m.Login) },
    { path: 'inscription', loadComponent: () => import('./features/Auth/pages/register/register').then(m => m.Register) },
  /*  { path: 'verification', loadComponent: () => import('./features/citizen/verification/verification').then(m => m.Verification) },*/

    // --- Routes protégées (regroupées sous un guard commun) ---
    {
      path: '',
     /* canActivate: [citizenAuthGuard],*/
      children: [
       /* { path: 'demande', loadComponent: () => import('./features/citizen/demande/demande').then(m => m.Demande) },
        { path: 'mes-demandes', loadComponent: () => import('./features/citizen/mes-demandes/mes-demandes').then(m => m.MesDemandes) },
        { path: 'suivi/:qrToken', loadComponent: () => import('./features/citizen/suivi/suivi').then(m => m.Suivi) },
        { path: 'profil', loadComponent: () => import('./features/citizen/profil/profil').then(m => m.Profil) },*/
      ],
    },
  ],
},
      // { path: 'connexion', loadComponent: () => ... }
      // { path: 'demande', loadComponent: () => ... }
      // { path: 'suivi/:qrToken', loadComponent: () => ... }

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
    component: Shell,
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

  // ===== Wildcard global, tout en bas =====
  { path: '**', redirectTo: 'accueil' },
];