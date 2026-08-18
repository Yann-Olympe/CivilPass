import { Component } from '@angular/core';

@Component({
  selector: 'app-probleme',
  imports: [],
  templateUrl: './probleme.html',
  styleUrl: './probleme.css',
})
export class Probleme {
    items = [
    { icon: '🚗', titre: 'Déplacements coûteux', texte: "Voyager vers votre mairie de naissance engendre des frais de transport importants et une perte de temps précieux." },
    { icon: '⏳', titre: "Files d'attente interminables", texte: "Les services de l'état civil sont souvent surchargés, nécessitant de longues heures d'attente sur place." },
    { icon: '⚠️', titre: "Risques d'erreurs", texte: "La recopie manuelle des informations augmente le risque d'erreurs sur vos documents officiels finaux." }
  ];
}
