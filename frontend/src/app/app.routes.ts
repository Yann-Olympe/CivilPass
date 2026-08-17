import { Routes } from '@angular/router';
import { Shell } from './Interface/layout/shell/shell';
import { Dashboard } from './Interface/pages/dashboard/dashboard';
import { Verification } from './Interface/pages/verification/verification';
import { DemandesList } from './Interface/pages/demandes-list/demandes-list';
import { TransfertsList } from './Interface/pages/transferts-list/transferts-list';
import { TransfertDetail } from './Interface/pages/transfert-detail/transfert-detail';

export const routes: Routes = [
  {
    path: '',
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
];
