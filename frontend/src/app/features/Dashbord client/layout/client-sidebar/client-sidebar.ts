import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { SupportModal } from '../../shared/components/support-modal/support-modal';
import { CitizenAuthService } from '../../../../Services/auth.service';

interface ClientNavItem {
  label: string;
  path: string;
  icon: string;
  exact: boolean;
}

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon, SupportModal],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.css',
})
export class ClientSidebar {
  private auth = inject(CitizenAuthService);
  private router = inject(Router);

  // Piloté par le shell : true = tiroir ouvert (mobile uniquement, ignoré en desktop).
  @Input() open = false;
  @Output() closeRequested = new EventEmitter<void>();

  navItems: ClientNavItem[] = [
    { label: 'Mon espace', path: '/espace', icon: 'grid', exact: true },
    { label: 'Mes demandes', path: '/espace/demandes', icon: 'folder', exact: false },
    { label: 'Mon profil', path: '/espace/profil', icon: 'user', exact: false },
  ];

  supportOpen = signal(false);

  openSupport(): void {
    this.supportOpen.set(true);
  }

  closeSupport(): void {
    this.supportOpen.set(false);
  }

  // Referme le tiroir après un clic sur un lien (sans effet en desktop).
  onLinkClick(): void {
    this.closeRequested.emit();
  }

  logout(): void {
    this.closeRequested.emit();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
