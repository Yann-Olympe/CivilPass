import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemandeActeStateService } from '../../../../Services/demande-acte-state.service';
import { DemandeService } from '../../../../Services/demande.service';
import { MairieService } from '../../../../Services/mairie.service';
import { ClientDemandesService } from '../../../Dashbord client/shared/services/client-demandes.service';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [],
  templateUrl: './validation.html',
  styleUrl: '../demande-wizard.css',
})
export class Validation {
  private router = inject(Router);
  private stateService = inject(DemandeActeStateService);
  private demandeService = inject(DemandeService);
  private mairieService = inject(MairieService);
  private clientDemandesService = inject(ClientDemandesService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  data = this.stateService.getState();
  mairies = this.mairieService.mairies;

  mairieOrigineNom = computed(() =>
    this.mairies()?.find(m => m.id === this.data.mairies?.mairieOrigineId)?.nom ?? '—'
  );

  mairieRetraitNom = computed(() =>
    this.mairies()?.find(m => m.id === this.data.mairies?.mairieRetraitId)?.nom ?? '—'
  );

  onModifier(section: 'acte' | 'mairie'): void {
    this.router.navigate([`demande/${section}`]);
  }

  onEnvoyer(): void {
    const payload = this.stateService.buildPayload();

    if (!payload) {
      this.errorMessage.set('Certaines informations sont manquantes. Merci de reprendre le parcours depuis le début.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.demandeService.creerDemande(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.clientDemandesService.charger();
        this.stateService.reset();
        this.router.navigate(['/espace/demandes', response.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'Votre session a expiré. Connectez-vous à nouveau avant de soumettre la demande.'
            : "L'envoi de votre demande a échoué. Veuillez réessayer."
        );
      },
    });
  }
}