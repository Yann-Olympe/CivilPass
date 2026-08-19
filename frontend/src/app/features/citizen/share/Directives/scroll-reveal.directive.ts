// shared/directives/scroll-reveal.directive.ts
import { Directive, ElementRef, inject, afterNextRender } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: { class: 'reveal' }
})
export class ScrollRevealDirective {
  private el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        this.el.nativeElement.classList.add('reveal-visible');
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('reveal-visible');
            observer.unobserve(this.el.nativeElement);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(this.el.nativeElement);
    });
  }
}