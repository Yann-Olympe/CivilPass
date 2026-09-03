import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../app/features/mairie/shared/icon/icon';
import { AuthFlow } from '../../app/features/Auth/services/auth-flow';

const DUREE_INITIALE = 272;

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})
export class Otp implements OnInit, OnDestroy {
  @ViewChildren('caseOtp') casesOtp!: QueryList<ElementRef<HTMLInputElement>>;

  chiffres = signal<string[]>(['', '', '', '']);
  secondesRestantes = signal(DUREE_INITIALE);
  envoiEnCours = signal(false);
  erreurCode = signal(false);
  secousse = signal(false);
  reussi = signal(false);

  private minuteur?: ReturnType<typeof setInterval>;

  codeComplet = computed(() => this.chiffres().every((c) => c !== ''));

  minuteurAffiche = computed(() => {
    const total = this.secondesRestantes();
    const minutes = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const secondes = (total % 60).toString().padStart(2, '0');
    return `${minutes}:${secondes}`;
  });

  peutRenvoyer = computed(() => this.secondesRestantes() === 0);

  constructor(protected authFlow: AuthFlow, private router: Router) {}

  ngOnInit() {
    this.demarrerMinuteur();
  }

  ngOnDestroy() {
    if (this.minuteur) clearInterval(this.minuteur);
  }

  private demarrerMinuteur() {
    if (this.minuteur) clearInterval(this.minuteur);
    this.secondesRestantes.set(DUREE_INITIALE);
    this.minuteur = setInterval(() => {
      this.secondesRestantes.update((v) => (v > 0 ? v - 1 : 0));
      if (this.secondesRestantes() === 0 && this.minuteur) {
        clearInterval(this.minuteur);
      }
    }, 1000);
  }

  saisir(index: number, evenement: Event) {
    const valeur = (evenement.target as HTMLInputElement).value.replace(/[^0-9]/g, '').slice(-1);
    const nouveau = [...this.chiffres()];
    nouveau[index] = valeur;
    this.chiffres.set(nouveau);
    this.erreurCode.set(false);

    if (valeur && index < 3) {
      this.casesOtp.get(index + 1)?.nativeElement.focus();
    }
  }

  surRetourArriere(index: number, evenement: KeyboardEvent) {
    if (evenement.key === 'Backspace' && !this.chiffres()[index] && index > 0) {
      this.casesOtp.get(index - 1)?.nativeElement.focus();
    }
  }

  coller(evenement: ClipboardEvent) {
    const texte = evenement.clipboardData?.getData('text').replace(/[^0-9]/g, '') ?? '';
    if (!texte) return;
    evenement.preventDefault();
    const chiffres = texte.slice(0, 4).split('');
    const nouveau = ['', '', '', ''];
    chiffres.forEach((c, i) => (nouveau[i] = c));
    this.chiffres.set(nouveau);
    const dernierIndex = Math.min(chiffres.length, 4) - 1;
    if (dernierIndex >= 0) {
      this.casesOtp.get(dernierIndex)?.nativeElement.focus();
    }
  }

  verifier() {
    if (!this.codeComplet() || this.envoiEnCours()) return;

    this.envoiEnCours.set(true);
    this.erreurCode.set(false);

    setTimeout(() => {
      this.envoiEnCours.set(false);
      const code = this.chiffres().join('');

      if (code === '0000') {
        this.erreurCode.set(true);
        this.secousse.set(true);
        this.chiffres.set(['', '', '', '']);
        this.casesOtp.get(0)?.nativeElement.focus();
        setTimeout(() => this.secousse.set(false), 420);
        return;
      }

      this.reussi.set(true);
      setTimeout(() => {
        this.authFlow.terminer();
        this.router.navigate(['/auth/login'], { queryParams: { inscrit: '1' } });
      }, 900);
    }, 900);
  }

  renvoyer() {
    if (!this.peutRenvoyer()) return;
    this.chiffres.set(['', '', '', '']);
    this.erreurCode.set(false);
    this.demarrerMinuteur();
    this.casesOtp.get(0)?.nativeElement.focus();
  }
}
