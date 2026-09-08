import { Component, ElementRef, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { CitizenAuthService } from '../../../../Services/auth.service';
import { ClientUserService } from '../../shared/services/client-user.service';
import { ClientNotificationsService } from '../../shared/services/client-notifications.service';

@Component({
  selector: 'app-client-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon, DatePipe],
  templateUrl: './client-topbar.html',
  styleUrl: './client-topbar.css',
})
export class ClientTopbar {
  private auth = inject(CitizenAuthService);
  private userService = inject(ClientUserService);
  private notificationsService = inject(ClientNotificationsService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  profile = this.userService.profile;
  initiales = this.userService.initiales;
  notifications = this.notificationsService.notifications;
  notificationsNonLues = this.notificationsService.nonLues;

  // En mobile, le burger n'ouvre plus un menu interne au topbar : il demande
  // au shell d'afficher le sidebar en tiroir.
  @Output() menuToggle = new EventEmitter<void>();

  avatarMenuOpen = signal(false);
  notificationsOpen = signal(false);
  currentLang = signal<'FR' | 'EN'>('FR');

  toggleAvatarMenu(): void {
    this.avatarMenuOpen.update((open) => !open);
    this.notificationsOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
    this.avatarMenuOpen.set(false);
  }

  lireNotification(notification: ReturnType<ClientNotificationsService['notifications']>[number]): void {
    this.notificationsService.marquerLue(notification);
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
      this.notificationsOpen.set(false);
    }
  }
}
