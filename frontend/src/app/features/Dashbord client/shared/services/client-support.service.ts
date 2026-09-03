import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface SupportRequest {
  sujet: string;
  message: string;
}

/**
 * Simule l'envoi d'un message au support depuis "Besoin d'aide ?".
 * TODO(API) : brancher sur POST /api/citoyen/support quand l'API sera prête.
 */
@Injectable({ providedIn: 'root' })
export class ClientSupportService {
  private readonly _sending = signal(false);
  readonly sending = this._sending.asReadonly();

  envoyer(request: SupportRequest): Observable<{ ok: true }> {
    this._sending.set(true);
    return of({ ok: true as const }).pipe(
      delay(700),
      tap(() => this._sending.set(false))
    );
  }
}
