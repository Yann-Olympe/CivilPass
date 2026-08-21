import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemandeActeStateService } from '../../../../Services/demande-acte-state.service';
import { DemandeService } from '../../../../Services/demande.service';
import { MairieService } from '../../../../Services/mairie.service';

interface LigneInfo {
  label: string;
  valeur: string;
}

interface BlocValidation {
  icone: 'demandeur' | 'acte' | 'mairie-origine' | 'mairie-retrait';
  titre: string;
  lignes: LigneInfo[];
}

@Component({
  selector: 'app-validation',
  imports: [],
  templateUrl: './validation.html',
  styleUrl: './validation.css',
})
export class Validation {
    private router = inject(Router);
  private stateService = inject(DemandeActeStateService);
  private demandeService = inject(DemandeService);
  private mairieService = inject(MairieService);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  data = this.stateService.getState();

  mairies = this.mairieService.mairies; // signal, depuis httpResource (ou mock selon ta version actuelle)

  mairieOrigineNom = computed(() =>
    this.mairies()?.find(m => m.id === this.data.mairies?.mairieOrigineId)?.nom ?? '—'
  );

  mairieRetraitNom = computed(() =>
    this.mairies()?.find(m => m.id === this.data.mairies?.mairieRetraitId)?.nom ?? '—'
  );

  onModifier(section: 'identite' | 'acte' | 'mairie'): void {
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
        this.stateService.reset();
        this.router.navigate(['/suivi', response.qr_token]);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set("L'envoi de votre demande a échoué. Veuillez réessayer.");
      }
    });
  }
}
