import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../mairies/shared/icon/icon';
import { AuthFlow } from '../../services/auth-flow';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  motDePasseVisible = signal(false);
  envoiEnCours = signal(false);
  secousse = signal(false);

  formulaire: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authFlow: AuthFlow) {
    this.formulaire = this.fb.group({
      nomComplet: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  basculerMotDePasse() {
    this.motDePasseVisible.update((v) => !v);
  }

  soumettre() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.declencherSecousse();
      return;
    }

    this.envoiEnCours.set(true);
    const { nomComplet, email } = this.formulaire.getRawValue();

    setTimeout(() => {
      this.envoiEnCours.set(false);
      this.authFlow.demarrerInscription(nomComplet ?? '', email ?? '');
      this.router.navigate(['/auth/otp']);
    }, 900);
  }

  continuerAvecGoogle() {
    this.envoiEnCours.set(true);
    setTimeout(() => {
      this.envoiEnCours.set(false);
      this.authFlow.demarrerInscription('Agent Google', 'agent.google@civilpass.cm');
      this.router.navigate(['/auth/otp']);
    }, 700);
  }

  private declencherSecousse() {
    this.secousse.set(true);
    setTimeout(() => this.secousse.set(false), 420);
  }

  erreur(champ: string, code: string) {
    const control = this.formulaire.get(champ);
    return !!control && control.touched && control.hasError(code);
  }

  invalide(champ: string) {
    const control = this.formulaire.get(champ);
    return !!control && control.touched && control.invalid;
  }
}
