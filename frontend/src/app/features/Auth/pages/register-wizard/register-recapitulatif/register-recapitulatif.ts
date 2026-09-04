import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterStateService } from '../../../../../Services/register-state.service';
import { CitizenAuthService } from '../../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-register-recapitulatif',
  standalone: true,
  templateUrl: './register-recapitulatif.html',
  styleUrl: '../register-wizard.css',
})
export class RegisterRecapitulatif {
  private state = inject(RegisterStateService);
  private citizenAuth = inject(CitizenAuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  identite = this.state.getIdentite();
  coordonnees = this.state.getCoordonnees();

  ngOnInit() {
    if (!this.state.isReadyForSubmit()) {
      this.router.navigate(['/inscription/identite']);
    }
  }

  precedent() {
    this.router.navigate(['/inscription/piece-identite']);
  }

  confirmer() {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.citizenAuth.register(this.state.buildPayload()).subscribe({
      next: () => {
        this.state.reset();
        this.router.navigate(['/espace']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 422 && err.error?.errors) {
          const premiere = Object.values(err.error.errors)[0] as string[];
          this.errorMessage.set(premiere[0]);
        } else {
          this.errorMessage.set('Une erreur est survenue. Réessayez.');
        }
      },
    });
  }
}