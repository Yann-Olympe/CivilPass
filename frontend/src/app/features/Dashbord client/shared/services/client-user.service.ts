import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ClientUserProfile, initialesOf } from '../models/client-user.model';
import { environment } from '../../../../../environments/environment';
import { mapperProfilVersPayload, mapperUsagerVersProfil } from '../../../../core/utils/client-user.mapper';
import { Usager } from '../../../../core/models/usager.model';

const PROFIL_VIDE: ClientUserProfile = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: '',
  dateNaissance: '',
};

/**
 * Branché sur GET/PATCH /api/citoyen/profil (voir client-user.mapper.ts pour la
 * conversion Usager backend ↔ ClientUserProfile frontend).
 */
@Injectable({ providedIn: 'root' })
export class ClientUserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/citoyen`;

  private readonly _profile = signal<ClientUserProfile>(PROFIL_VIDE);
  private readonly _loading = signal(false);
  private readonly _erreur = signal<string | null>(null);
  private readonly _saving = signal(false);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly initiales = computed(() => initialesOf(this._profile()));

  constructor() {
    this.charger();
  }

  charger(): void {
    this._loading.set(true);
    this._erreur.set(null);

    this.http
      .get<Usager>(`${this.baseUrl}/me`)
      .pipe(
        tap((usager) => {
          this._profile.set(mapperUsagerVersProfil(usager));
          this._loading.set(false);
        }),
        catchError(() => {
          this._erreur.set('Impossible de récupérer votre profil pour le moment.');
          this._loading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  getProfile(): ClientUserProfile {
    return this._profile();
  }

  updateProfile(patch: ClientUserProfile): Observable<ClientUserProfile> {
    this._saving.set(true);
    const payload = mapperProfilVersPayload(patch);

    return this.http.patch<Usager>(`${this.baseUrl}/profil`, payload).pipe(
      map(mapperUsagerVersProfil),
      tap((profil) => {
        this._profile.set(profil);
        this._saving.set(false);
      }),
      catchError((err) => {
        this._saving.set(false);
        throw err;
      })
    );
  }
}