import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ClientUserProfile, initialesOf } from '../models/client-user.model';
import { CLIENT_USER_MOCK } from '../data/user-client.mock';

/**
 * Simule un service backend de gestion du profil citoyen.
 * TODO(API) : brancher sur GET/PATCH /api/citoyen/profil quand l'API sera prête.
 */
@Injectable({ providedIn: 'root' })
export class ClientUserService {
  private readonly _profile = signal<ClientUserProfile>(CLIENT_USER_MOCK);
  private readonly _saving = signal(false);

  readonly profile = this._profile.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly initiales = computed(() => initialesOf(this._profile()));

  getProfile(): ClientUserProfile {
    return this._profile();
  }

  /** Simule un PATCH réseau (600ms) puis met à jour le profil local. */
  updateProfile(patch: ClientUserProfile): Observable<ClientUserProfile> {
    this._saving.set(true);
    return of(patch).pipe(
      delay(600),
      tap((updated) => {
        this._profile.set(updated);
        this._saving.set(false);
      })
    );
  }
}
