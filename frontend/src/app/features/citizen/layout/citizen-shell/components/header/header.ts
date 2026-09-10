import { Component, AfterViewInit, OnDestroy, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenAuthService } from '../../../../../../Services/citizen-auth.service';

const SECTIONS = ['probleme', 'comment-ca-marche', 'reseau', 'hors-ligne'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit, OnDestroy {
  auth = inject(CitizenAuthService);
  private elementRef = inject(ElementRef);

  mobileMenuOpen = signal(false);
  activeSection = signal<string | null>(null);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        // Trouve la section la plus visible actuellement à l'écran
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          this.activeSection.set(visible.target.id);
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px', // considère "active" la section proche du centre de l'écran
        threshold: 0,
      }
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