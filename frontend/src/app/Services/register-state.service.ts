import { Injectable, signal } from '@angular/core';

export interface IdentiteStep {
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  date_naissance: string;
  lieu_naissance: string;
}

export interface CoordonneesStep {
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  region: string;
  nationalite: string;
}

export interface SecuriteStep {
  password: string;
  password_confirmation: string;
}

export interface PieceIdentiteStep {
  cniRectoPreview: string | null; // data URL, local uniquement
  cniVersoPreview: string | null;
}

@Injectable({ providedIn: 'root' })
export class RegisterStateService {
  private identite = signal<IdentiteStep | null>(null);
  private coordonnees = signal<CoordonneesStep | null>(null);
  private securite = signal<SecuriteStep | null>(null);
  private pieceIdentite = signal<PieceIdentiteStep>({ cniRectoPreview: null, cniVersoPreview: null });

  setIdentite(data: IdentiteStep) {
    this.identite.set(data);
  }

  setCoordonnees(data: CoordonneesStep) {
    this.coordonnees.set(data);
  }

  setSecurite(data: SecuriteStep) {
    this.securite.set(data);
  }

  setPieceIdentite(data: PieceIdentiteStep) {
    this.pieceIdentite.set(data);
  }

  getIdentite() { return this.identite(); }
  getCoordonnees() { return this.coordonnees(); }
  getSecurite() { return this.securite(); }
  getPieceIdentite() { return this.pieceIdentite(); }

  isReadyForSubmit(): boolean {
    return !!this.identite() && !!this.coordonnees() && !!this.securite();
  }

  /** Construit le payload réel — la CNI n'est volontairement PAS incluse, pas d'endpoint backend encore */
  buildPayload() {
    const id = this.identite()!;
    const co = this.coordonnees()!;
    const se = this.securite()!;
    return { ...id, ...co, ...se };
  }

  reset() {
    this.identite.set(null);
    this.coordonnees.set(null);
    this.securite.set(null);
    this.pieceIdentite.set({ cniRectoPreview: null, cniVersoPreview: null });
  }
}