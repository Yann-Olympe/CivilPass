import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemandeActeStateService } from '../../../../Services/demande-acte-state.service';

@Component({
  selector: 'app-acte',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './acte.html',
  styleUrl: '../demande-wizard.css',
})
export class Acte {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(DemandeActeStateService);

  currentYear = new Date().getFullYear();
  years: number[] = Array.from({ length: this.currentYear - 1950 + 1 }, (_, i) => this.currentYear - i);

  formSubmitted = false;

  acteForm: FormGroup = this.fb.group({
    numeroActe: ['', [Validators.required]],
    anneeEnregistrement: ['', [Validators.required]],
    nomPere: [''],
    nomMere: [''],
  });

  ngOnInit() {
    const dejaSaisi = this.stateService.getState().acte;
    if (dejaSaisi) {
      this.acteForm.patchValue(dejaSaisi);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.acteForm.get(controlName);
    if (!control) return false;
    return control.invalid && (control.touched || this.formSubmitted);
  }

  onSuivant(): void {
    this.formSubmitted = true;
    if (this.acteForm.valid) {
      this.stateService.setActe(this.acteForm.value);
      this.router.navigate(['/demande/mairie']);
    } else {
      this.acteForm.markAllAsTouched();
    }
  }
}