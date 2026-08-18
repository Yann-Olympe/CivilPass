import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { Probleme } from './components/probleme/probleme';
import { Reseau } from './components/reseau/reseau';
import { ModeHorsLigne } from './components/mode-hors-ligne/mode-hors-ligne';
import { CommentCaMarche } from './components/comment-ca-marche/comment-ca-marche';
import { Solution } from './components/solution/solution';
import { CtaFinal } from './components/cta-final/cta-final';
import { CopieActe } from './components/copie-acte/copie-acte';

@Component({
  selector: 'app-accueil',
  imports: [Hero,Probleme,Reseau,ModeHorsLigne,CommentCaMarche,Solution,CtaFinal,CopieActe],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil {}
