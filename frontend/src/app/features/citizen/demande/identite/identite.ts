import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DemandeActeStateService } from '../../../../Services/demande-acte-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-identite',
  imports: [ReactiveFormsModule],
  templateUrl: './identite.html',
  styleUrl: './identite.css',
})
export class Identite {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(DemandeActeStateService);

  formSubmitted = false;

  identiteForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.pattern(/^6\d{8}$/)]],
    cni: ['']
  });

  isInvalid(controlName: string): boolean {
    const control = this.identiteForm.get(controlName);
    if (!control) return false;
    return control.invalid && (control.touched || this.formSubmitted);
  }

  onPrecedent(): void {
    this.router.navigate(['/accueil']);
  }

  onSuivant(): void {
    this.formSubmitted = true;

    if (this.identiteForm.valid) {
      this.stateService.setIdentite(this.identiteForm.value);
      this.router.navigate(['/demande/acte']);
    } else {
      this.identiteForm.markAllAsTouched();
    }
  }
}
