import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';
import { REGIONS_CAMEROUN } from '../../../shared/regions-cameroun';

@Component({
  selector: 'app-register-coordonnees',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-coordonnees.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterCoordonnees {
  private fb = inject(FormBuilder);
  private state = inject(RegisterStateService);
  private router = inject(Router);

  regions = REGIONS_CAMEROUN;
  secousse = signal(false);

  formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.maxLength(20)]],
    adresse: ['', [Validators.required, Validators.maxLength(255)]],
    ville: ['', [Validators.required, Validators.maxLength(100)]],
    region: ['', [Validators.required]],
    nationalite: ['Camerounaise', [Validators.required]],
  });

  ngOnInit() {
    if (!this.state.getIdentite()) {
      this.router.navigate(['/inscription/identite']);
      return;
    }
    const dejaSaisi = this.state.getCoordonnees();
    if (dejaSaisi) {
      this.formulaire.patchValue(dejaSaisi);
    }
  }

  precedent() {
    this.router.navigate(['/inscription/identite']);
  }

  suivant() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.declencherSecousse();
      return;
    }
    this.state.setCoordonnees(this.formulaire.getRawValue() as any);
    this.router.navigate(['/inscription/securite']);
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