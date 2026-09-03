import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';

@Component({
  selector: 'app-register-piece-identite',
  standalone: true,
  templateUrl: './register-piece-identite.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterPieceIdentite {
  private state = inject(RegisterStateService);
  private router = inject(Router);

  rectoPreview = signal<string | null>(null);
  versoPreview = signal<string | null>(null);

  onFileChange(event: Event, cote: 'recto' | 'verso') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      if (cote === 'recto') this.rectoPreview.set(preview);
      else this.versoPreview.set(preview);
    };
    reader.readAsDataURL(file);
  }

  precedent() {
    this.router.navigate(['/inscription/securite']);
  }

  suivant() {
    this.state.setPieceIdentite({
      cniRectoPreview: this.rectoPreview(),
      cniVersoPreview: this.versoPreview(),
    });
    this.router.navigate(['/inscription/recapitulatif']);
  }

  passer() {
    this.router.navigate(['/inscription/recapitulatif']);
  }
}