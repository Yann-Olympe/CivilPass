import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../../share/Directives/scroll-reveal.directive';

@Component({
  selector: 'app-cta-final',
  imports: [RouterLink],
  templateUrl: './cta-final.html',
  styleUrl: './cta-final.css',
})
export class CtaFinal {}
