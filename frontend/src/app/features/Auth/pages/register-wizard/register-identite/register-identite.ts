import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';

@Component({
  selector: 'app-register-identite',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-identite.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterIdentite {
  private fb = inject(FormBuilder);
  private state = inject(RegisterStateService);
  private router = inject(Router);

  formulaire = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    sexe: ['', [Validators.required]],
    date_naissance: ['', [Validators.required]],
    lieu_naissance: ['', [Validators.required, Validators.maxLength(150)]],
  });

  suivant() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.state.setIdentite(this.formulaire.getRawValue() as any);
    this.router.navigate(['/inscription/coordonnees']);
  }
}