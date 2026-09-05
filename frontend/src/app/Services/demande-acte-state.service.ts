import { Injectable } from '@angular/core';
import { ActeData, DemandeActePayload, DemandeActeState, MairiesData } from '../shared/models/demande-acte.model';

@Injectable({ providedIn: 'root' })
export class DemandeActeStateService {
  private state: DemandeActeState = {};

  setActe(data: ActeData): void {
    this.state.acte = data;
  }

  setMairies(data: MairiesData): void {
    this.state.mairies = data;
  }

  getState(): DemandeActeState {
    return this.state;
  }

  isReadyForValidation(): boolean {
    return !!(this.state.acte && this.state.mairies);
  }

  buildPayload(): DemandeActePayload | null {
    const { acte, mairies } = this.state;
    if (!acte || !mairies) return null;

    return {
      mairie_origine_id: mairies.mairieOrigineId,
      mairie_retrait_id: mairies.mairieRetraitId,
      numero_acte: acte.numeroActe,
      annee_acte: acte.anneeEnregistrement,
      filiation: {
        pere_nom: acte.nomPere ?? '',
        mere_nom: acte.nomMere ?? '',
      },
    };
  }

  reset(): void {
    this.state = {};
  }
}