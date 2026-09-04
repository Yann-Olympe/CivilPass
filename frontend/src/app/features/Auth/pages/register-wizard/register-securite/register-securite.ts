import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';

@Component({
  selector: 'app-register-securite',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-securite.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterSecurite {
  private fb = inject(FormBuilder);
  private state = inject(RegisterStateService);
  private router = inject(Router);

  motDePasseVisible = signal(false);
  confirmationVisible = signal(false);
  secousse = signal(false);

  formulaire: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.motsDePasseIdentiques });

  private motsDePasseIdentiques(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    return pass === confirm ? null : { motsDePasseDifferents: true };
  }

  ngOnInit() {
    if (!this.state.getCoordonnees()) {
      this.router.navigate(['/inscription/coordonnees']);
    }
  }

  basculerMotDePasse() {
    this.motDePasseVisible.update((v) => !v);
  }

  basculerConfirmation() {
    this.confirmationVisible.update((v) => !v);
  }

  precedent() {
    this.router.navigate(['/inscription/coordonnees']);
  }

  suivant() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.declencherSecousse();
      return;
    }
    this.state.setSecurite(this.formulaire.getRawValue() as any);
    this.router.navigate(['/inscription/piece-identite']);
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