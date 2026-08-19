import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../../../share/Directives/scroll-reveal.directive';


@Component({
  selector: 'app-solution',
  imports: [ScrollRevealDirective],
  templateUrl: './solution.html',
  styleUrl: './solution.css',
})
export class Solution {
   etapes = [
    { num: 1, acteur: 'Vous', texte: "Initiez la demande en ligne en quelques minutes, depuis n'importe où, sur votre téléphone ou ordinateur." },
    { num: 2, acteur: 'CivilPass', texte: "Vérifie, sécurise et transmet instantanément votre dossier numérique à l'officier d'état civil compétent." },
    { num: 3, acteur: 'Votre Mairie', texte: "Traite officiellement la demande et expédie le document final certifié vers la mairie de retrait choisie." }
  ];
}
