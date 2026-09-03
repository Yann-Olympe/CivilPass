import { Component, inject } from '@angular/core';
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
    }
  }

  precedent() {
    this.router.navigate(['/inscription/identite']);
  }

  suivant() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.state.setCoordonnees(this.formulaire.getRawValue() as any);
    this.router.navigate(['/inscription/securite']);
  }
}