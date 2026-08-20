import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthFlow {
  private readonly _emailEnAttente = signal<string | null>(null);
  private readonly _nomEnAttente = signal<string | null>(null);

  emailEnAttente = this._emailEnAttente.asReadonly();
  nomEnAttente = this._nomEnAttente.asReadonly();

  demarrerInscription(nom: string, email: string) {
    this._nomEnAttente.set(nom);
    this._emailEnAttente.set(email);
  }

  emailMasque(): string {
    const email = this._emailEnAttente();
    if (!email) {
      return 'v****e@civilpass.cm';
    }
    const [local, domaine] = email.split('@');
    if (!domaine || local.length < 2) {
      return email;
    }
    const visible = local[0];
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}${local[local.length - 1]}@${domaine}`;
  }

  terminer() {
    this._emailEnAttente.set(null);
    this._nomEnAttente.set(null);
  }
}
