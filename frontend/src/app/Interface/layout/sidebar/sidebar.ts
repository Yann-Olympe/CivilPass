import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

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
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'grid', path: '/tableau-de-bord' },
    { label: 'Demandes', icon: 'file', path: '/demandes' },
    { label: 'En cours', icon: 'hourglass', path: '/en-cours' },
    { label: 'Validées', icon: 'shield-check', path: '/validees' },
    { label: 'Rejetées', icon: 'x', path: '/rejetees' },
    { label: 'Transferts', icon: 'transfer', path: '/transferts' },
    { label: 'Historique', icon: 'archive', path: '/historique' },
  ];
}
