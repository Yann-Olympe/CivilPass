import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { AgentAuthService } from '../../../../Services/agent-auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private auth = inject(AgentAuthService);
  private router = inject(Router);

  profile = this.auth.profile;

  nomAgent = computed(() => {
    const p = this.profile();
    if (!p) return '—';
    return `${p.prenom ?? ''} ${p.nom}`.trim();
  });

  nomMairie = computed(() => this.profile()?.mairie?.nom ?? '—');

  initiale = computed(() => {
    const p = this.profile();
    return p?.nom?.trim()?.[0]?.toUpperCase() ?? 'A';
  });

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'grid', path: '/mairie/tableau-de-bord' },
    { label: 'Demandes', icon: 'file', path: '/mairie/demandes' },
    { label: 'En cours', icon: 'hourglass', path: '/mairie/en-cours' },
    { label: 'Validées', icon: 'shield-check', path: '/mairie/validees' },
    { label: 'Rejetées', icon: 'x', path: '/mairie/rejetees' },
    { label: 'Transferts', icon: 'transfer', path: '/mairie/transferts' },
    { label: 'Historique', icon: 'archive', path: '/mairie/historique' },
  ];

  onLogout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/mairie/connexion']),
      error: () => {
        // Même si l'appel serveur échoue, on nettoie quand même la session locale
        this.router.navigate(['/mairie/connexion']);
      },
    });
  }
}