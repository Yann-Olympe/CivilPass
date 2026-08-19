import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../../share/Directives/scroll-reveal.directive';


@Component({
  selector: 'app-probleme',
  imports: [ScrollRevealDirective],
  templateUrl: './probleme.html',
  styleUrl: './probleme.css',
})
export class Probleme {
  items = [
      { icon: 'warning', titre: 'Déplacements coûteux', texte: "Voyager vers votre mairie de naissance engendre des frais de transport importants et une perte de temps précieux." },
      { icon: 'clock', titre: "Files d'attente interminables", texte: "Les services de l'état civil sont souvent surchargés, nécessitant de longues heures d'attente sur place." },
      { icon: 'pencil', titre: "Risques d'erreurs", texte: "La recopie manuelle des informations augmente le risque d'erreurs sur vos documents officiels finaux." }
    ];
}
