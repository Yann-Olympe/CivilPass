import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


interface _Mairie {
  id: number;
  nom: string;
}


@Component({
  selector: 'app-mairie',
  imports: [ReactiveForms],
  templateUrl: './mairie.html',
  styleUrl: './mairie.css',
})
export class Mairie {
  
  private readonly fb = inject(FormBuilder);

  readonly mairies: _Mairie[] = [
    {
      id: 1,
      nom: 'Mairie de Douala 3e',
    },
    {
      id: 2,
      nom: 'Mairie de Yaoundé 1er',
    },
    {
      id: 3,
      nom: 'Mairie de Douala 1er',
    },
    {
      id: 4,
      nom: 'Mairie de Yaoundé 4e',
    },
  ];

  readonly form = this.fb.nonNullable.group({
    mairieOrigineId: ['', Validators.required],
    mairieRetraitId: ['', Validators.required],
  });

  submitted = false;

  onNext(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Choix des mairies :', this.form.getRawValue());
  }

  isInvalid(controlName: 'mairieOrigineId' | 'mairieRetraitId'): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || this.submitted);
  }

}
