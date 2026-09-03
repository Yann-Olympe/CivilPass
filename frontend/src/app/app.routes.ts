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

  // ===== Partie citoyen (inchangée) =====
  {
    path: '',
    component: CitizenShell,
    children: [
      { path: 'accueil', loadComponent: () => import('./features/citizen/accueil/accueil').then(m => m.Accueil) },
      { path: 'demande/identite', loadComponent: () => import('./features/citizen/demande/identite/identite').then(m => m.Identite) },
      { path: 'demande/acte', loadComponent: () => import('./features/citizen/demande/acte/acte').then(m => m.Acte) },
      { path: 'demande/mairie', loadComponent: () => import('./features/citizen/demande/mairie/mairie').then(m => m.Mairie) },
      { path: 'demande/validation', loadComponent: () => import('./features/citizen/demande/validation/validation').then(m => m.Validation) },
      { path: 'login', loadComponent: () => import('./features/Auth/pages/login/login').then(m => m.Login) },
      { path: 'register', loadComponent: () => import('./features/Auth/pages/register/register').then(m => m.Register) },

      {
        path: '',
        children: [],
      },
    ],
  },

  // ===== Partie mairie =====
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