import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../../mairie/shared/icon/icon';
import { CitizenAuthService } from '../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private citizenAuth = inject(CitizenAuthService);

  motDePasseVisible = signal(false);
  envoiEnCours = signal(false);
  secousse = signal(false);
  erreurServeur = signal<string | null>(null);

  formulaire: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]],
    date_naissance: ['', [Validators.required]],
    lieu_naissance: ['', [Validators.required, Validators.maxLength(150)]],
    sexe: ['', [Validators.required]],
    nationalite: ['Camerounaise', [Validators.required, Validators.maxLength(100)]],
    adresse: ['', [Validators.required, Validators.maxLength(255)]],
    ville: ['', [Validators.required, Validators.maxLength(100)]],
    region: ['', [Validators.required, Validators.maxLength(100)]],
  }, { validators: this.motsDePasseIdentiques });

  private motsDePasseIdentiques(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    return pass === confirm ? null : { motsDePasseDifferents: true };
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
    this.erreurServeur.set(null);

    this.citizenAuth.register(this.formulaire.getRawValue()).subscribe({
      next: () => {
        this.envoiEnCours.set(false);
        this.router.navigate(['/espace']);
      },
      error: (err) => {
        this.envoiEnCours.set(false);
        this.declencherSecousse();

        if (err.status === 422 && err.error?.errors) {
          const premiereErreur = Object.values(err.error.errors)[0] as string[];
          this.erreurServeur.set(premiereErreur[0]);
        } else {
          this.erreurServeur.set('Une erreur est survenue. Réessayez.');
        }
      },
    });
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