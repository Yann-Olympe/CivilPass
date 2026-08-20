import { Routes } from '@angular/router';
import { Shell } from './features/mairies/layout/shell/shell';
import { Dashboard } from './features/mairies/pages/dashboard/dashboard';
import { Verification } from './features/mairies/pages/verification/verification';
import { DemandesList } from './features/mairies/pages/demandes-list/demandes-list';
import { TransfertsList } from './features/mairies/pages/transferts-list/transferts-list';
import { TransfertDetail } from './features/mairies/pages/transfert-detail/transfert-detail';
import { AuthShell } from './features/Auth/layout/auth-shell/auth-shell';
import { Login } from './features/Auth/pages/login/login';
import { Register } from './features/Auth/pages/register/register';
import { Otp } from './features/Auth/pages/otp/otp';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'register', pathMatch: 'full' },
      { path: 'login', component: Login },
      {
        path: '',
        component: AuthShell,
        children: [
          { path: 'register', component: Register, data: { etape: 1 } },
          { path: 'otp', component: Otp, data: { etape: 2 } },
        ],
      },
    ],
  },
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
