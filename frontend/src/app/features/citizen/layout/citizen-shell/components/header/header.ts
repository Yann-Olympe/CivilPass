import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenAuthService } from '../../../../../../Services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(CitizenAuthService);

  mobileMenuOpen = signal(false);
  currentLang = signal<'FR' | 'EN'>('FR');

  toggleMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleLang(): void {
    this.currentLang.update(lang => (lang === 'FR' ? 'EN' : 'FR'));
    // TODO : brancher un vrai service i18n (Angular i18n ou ngx-translate)
    // pour effectivement changer la langue affichée dans l'app.
    // Ce signal ne fait pour l'instant que changer le texte du bouton.
  }
}