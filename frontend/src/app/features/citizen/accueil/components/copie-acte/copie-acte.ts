import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-copie-acte',
  imports: [RouterLink],
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
