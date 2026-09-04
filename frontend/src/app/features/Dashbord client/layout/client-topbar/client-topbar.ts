import { Component, ElementRef, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { CitizenAuthService } from '../../../../Services/auth.service';
import { ClientUserService } from '../../shared/services/client-user.service';

@Component({
  selector: 'app-client-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './client-topbar.html',
  styleUrl: './client-topbar.css',
})
export class ClientTopbar {
  private auth = inject(CitizenAuthService);
  private userService = inject(ClientUserService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  profile = this.userService.profile;
  initiales = this.userService.initiales;

  // En mobile, le burger n'ouvre plus un menu interne au topbar : il demande
  // au shell d'afficher le sidebar en tiroir.
  @Output() menuToggle = new EventEmitter<void>();

  avatarMenuOpen = signal(false);
  currentLang = signal<'FR' | 'EN'>('FR');

  toggleAvatarMenu(): void {
    this.avatarMenuOpen.update((open) => !open);
  }

  toggleLang(): void {
    this.currentLang.update((lang) => (lang === 'FR' ? 'EN' : 'FR'));
    // TODO(i18n) : brancher un vrai service de traduction (Angular i18n / ngx-translate).
  }

  goToProfile(): void {
    this.avatarMenuOpen.set(false);
    this.router.navigate(['/espace/profil']);
  }

  logout(): void {
    this.avatarMenuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.avatarMenuOpen.set(false);
    }
  }
}
