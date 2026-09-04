import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';

@Component({
  selector: 'app-register-identite',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-identite.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterIdentite {
  private fb = inject(FormBuilder);
  private state = inject(RegisterStateService);
  private router = inject(Router);

  secousse = signal(false);

  formulaire = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    sexe: ['', [Validators.required]],
    date_naissance: ['', [Validators.required]],
    lieu_naissance: ['', [Validators.required, Validators.maxLength(150)]],
  });

  ngOnInit() {
    const dejaSaisi = this.state.getIdentite();
    if (dejaSaisi) {
      this.formulaire.patchValue(dejaSaisi);
    }
  }

  suivant() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.declencherSecousse();
      return;
    }
    this.state.setIdentite(this.formulaire.getRawValue() as any);
    this.router.navigate(['/inscription/coordonnees']);
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