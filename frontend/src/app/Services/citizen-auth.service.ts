import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, InscriptionPayload, Usager } from '../core/models/usager.model';

const STORAGE_TOKEN = 'civilpass_citoyen_token';
const STORAGE_USAGER = 'civilpass_citoyen_usager';
const storage = () => typeof localStorage === 'undefined' ? null : localStorage;

@Injectable({ providedIn: 'root' })
export class CitizenAuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/citoyen`;

  private readonly _usager = signal<Usager | null>(this.lireUsagerStocke());
  private readonly _token = signal<string | null>(storage()?.getItem(STORAGE_TOKEN) ?? null);
  private readonly _deconnexionEnCours = signal(false);

  usager = this._usager.asReadonly();
  estConnecte = computed(() => !!this._token());
  deconnexionEnCours = this._deconnexionEnCours.asReadonly();

  register(payload: InscriptionPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((res) => this.demarrerSession(res))
    );
  }

  login(identifiant: string, password: string): Observable<AuthResponse> {
    const estEmail = identifiant.includes('@');
    const body = estEmail
      ? { email: identifiant, password }
      : { telephone: identifiant, password };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body).pipe(
      tap((res) => this.demarrerSession(res))
    );
  }

  me(): Observable<Usager> {
    return this.http.get<Usager>(`${this.baseUrl}/profile`).pipe(
      tap((usager) => {
        this._usager.set(usager);
        storage()?.setItem(STORAGE_USAGER, JSON.stringify(usager));
      })
    );
  }

  logout(): Observable<{ message: string }> {
    this._deconnexionEnCours.set(true);
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}).pipe(
      finalize(() => {
        this.terminerSession();
        this._deconnexionEnCours.set(false);
      })
    );
  }

  getToken(): string | null {
    return this._token();
  }

  invaliderSession(): void {
    this.terminerSession();
  }

  private demarrerSession(res: AuthResponse): void {
    this._usager.set(res.usager);
    this._token.set(res.token);
    storage()?.setItem(STORAGE_TOKEN, res.token);
    storage()?.setItem(STORAGE_USAGER, JSON.stringify(res.usager));
  }

  private terminerSession(): void {
    this._usager.set(null);
    this._token.set(null);
    storage()?.removeItem(STORAGE_TOKEN);
    storage()?.removeItem(STORAGE_USAGER);
  }

  private lireUsagerStocke(): Usager | null {
    const brut = storage()?.getItem(STORAGE_USAGER);
    if (!brut) return null;
    try {
      return JSON.parse(brut) as Usager;
    } catch {
      storage()?.removeItem(STORAGE_USAGER);
      return null;
    }
  }
}
