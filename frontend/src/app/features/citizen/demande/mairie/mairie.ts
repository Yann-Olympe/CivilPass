import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemandeActeStateService } from '../../../../Services/demande-acte-state.service';
import { MairieService } from '../../../../Services/mairie.service';




@Component({
  selector: 'app-mairie',
  imports: [ReactiveFormsModule],
  templateUrl: './mairie.html',
  styleUrl: './mairie.css',
})
export class Mairie {
 private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(DemandeActeStateService);
  mairieService = inject(MairieService); // public — utilisé directement dans le template

  formSubmitted = false;

  mairiesForm: FormGroup = this.fb.group({
    mairieOrigineId: ['', [Validators.required]],
    mairieRetraitId: ['', [Validators.required]]
  });

  isInvalid(controlName: string): boolean {
    const control = this.mairiesForm.get(controlName);
    if (!control) return false;
    return control.invalid && (control.touched || this.formSubmitted);
  }

  onRetour(): void {
    this.router.navigate(['demande/acte']);
  }

  onContinuer(): void {
    this.formSubmitted = true;

    if (this.mairiesForm.valid) {
      this.stateService.setMairies(this.mairiesForm.value);
      this.router.navigate(['demande/validation']);
    } else {
      this.mairiesForm.markAllAsTouched();
    }
  }

}
