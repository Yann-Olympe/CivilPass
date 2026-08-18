import { Component } from '@angular/core';

@Component({
  selector: 'app-comment-ca-marche',
  imports: [],
  templateUrl: './comment-ca-marche.html',
  styleUrl: './comment-ca-marche.css',
})
export class CommentCaMarche {
  etapes = [
    { num: 1, titre: 'Le Citoyen', texte: 'Vous soumettez votre demande en ligne sur CivilPass, en précisant votre Mairie de naissance et celle où vous souhaitez retirer l\'acte.' },
    { num: 2, titre: 'Mairie de Naissance', texte: 'Votre mairie d\'origine reçoit la demande sécurisée, vérifie les registres officiels, et transmet numériquement une copie certifiée.' },
    { num: 3, titre: 'Mairie de Retrait', texte: 'La mairie proche de chez vous reçoit l\'acte, l\'imprime, le certifie physiquement et vous le remet en main propre.' }
  ];
}
