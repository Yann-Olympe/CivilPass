import { Routes } from '@angular/router';
import { CitizenShell } from './features/citizen/layout/citizen-shell/citizen-shell';
import { Shell } from './Interface/layout/shell/shell';
import { Dashboard } from './Interface/pages/dashboard/dashboard';
import { Verification } from './Interface/pages/verification/verification';
import { DemandesList } from './Interface/pages/demandes-list/demandes-list';
import { TransfertsList } from './Interface/pages/transferts-list/transferts-list';
import { TransfertDetail } from './Interface/pages/transfert-detail/transfert-detail';

export const routes: Routes = [
  // ===== Racine : redirige vers TA partie (citoyen) =====
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // ===== Ta partie (citoyen) =====
  {
    path: '',
    component: CitizenShell,
    children: [
      {
        path: 'accueil',
        loadComponent: () =>
          import('./features/citizen/accueil/accueil').then((m) => m.Accueil),
      },
      // { path: 'connexion', loadComponent: () => ... }
      // { path: 'demande', loadComponent: () => ... }
      // { path: 'suivi/:qrToken', loadComponent: () => ... }
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