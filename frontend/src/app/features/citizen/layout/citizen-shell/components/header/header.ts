import { Component, AfterViewInit, OnDestroy, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CitizenAuthService } from '../../../../../../Services/citizen-auth.service';

const SECTIONS = ['probleme', 'reseau', 'comment-ca-marche', 'hors-ligne'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit, OnDestroy {
  auth = inject(CitizenAuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  mobileMenuOpen = signal(false);
  activeSection = signal<string | null>(null);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    // La landing est chargée en lazy-loading après le header :
    // on (ré)observe les sections après chaque navigation.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => setTimeout(() => this.observeSections(), 150));

    setTimeout(() => this.observeSections(), 300);
  }

  private observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer?.disconnect();
    this.activeSection.set(null);

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          this.activeSection.set(visible.target.id);
        } else if (entries.some(e => e.target.id === this.activeSection())) {
          this.activeSection.set(null); // on a quitté la section active
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.observer!.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}