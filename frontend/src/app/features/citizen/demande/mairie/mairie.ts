import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


interface _Mairie {
  id: number;
  nom: string;
}


@Component({
  selector: 'app-mairie',
  imports: [ReactiveFormsModule],
  templateUrl: './mairie.html',
  styleUrl: './mairie.css',
})
export class Mairie {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);

  formSubmitted = false;

  // Données mockées en attendant l'endpoint GET /api/mairies
  mairies: _Mairie[] = [
    { id: 1, nom: 'Mairie de Douala 1er' },
    { id: 2, nom: 'Mairie de Douala 2e' },
    { id: 3, nom: 'Mairie de Douala 3e' },
    { id: 4, nom: 'Mairie de Yaoundé I' },
    { id: 5, nom: 'Mairie de Yaoundé II' }
  ];

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
    this.router.navigate(['/demande/acte']);
  }

  onContinuer(): void {
    this.formSubmitted = true;

    if (this.mairiesForm.valid) {
      console.log(this.mairiesForm.value);
      this.router.navigate(['/demande/validation']);
    } else {
      this.mairiesForm.markAllAsTouched();
    }
  }

}
