import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acte',
  imports: [ReactiveFormsModule],
  templateUrl: './acte.html',
  styleUrl: './acte.css',
})
export class Acte {
   private fb = inject(FormBuilder);
  private router = inject(Router);

  currentYear = new Date().getFullYear();
  years: number[] = Array.from({ length: this.currentYear - 1950 + 1 }, (_, i) => this.currentYear - i);

  formSubmitted = false;

  acteForm: FormGroup = this.fb.group({
    numeroActe: ['', [Validators.required]],
    anneeEnregistrement: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    prenoms: [''],
    nomPere: [''],
    nomMere: ['']
  });

  isInvalid(controlName: string): boolean {
    const control = this.acteForm.get(controlName);
    if (!control) return false;
    return control.invalid && (control.touched || this.formSubmitted);
  }

  onPrecedent(): void {
    this.router.navigate(['/']);
  }

  onSuivant(): void {
    this.formSubmitted = true;

    if (this.acteForm.valid) {
      console.log(this.acteForm.value);
      this.router.navigate(['/demande/mairie']);
    } else {
      this.acteForm.markAllAsTouched();
    }
  }
}
