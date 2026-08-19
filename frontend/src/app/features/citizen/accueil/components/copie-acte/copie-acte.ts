import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../../share/Directives/scroll-reveal.directive';

@Component({
  selector: 'app-copie-acte',
  imports: [ScrollRevealDirective],
  templateUrl: './copie-acte.html',
  styleUrl: './copie-acte.css',
})
export class CopieActe {
  features = [
    { icon: '⚡', texte: 'Processus 100% numérisé' },
    { icon: '🔒', texte: 'Données sécurisées' },
    { icon: '🔄', texte: 'Transfert inter-mairies rapide' }
  ];
}
