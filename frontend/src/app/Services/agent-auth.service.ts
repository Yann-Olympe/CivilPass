import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AgentLoginPayload, AgentAuthResponse, AgentProfile } from '../core/models/agent-auth.model';

const TOKEN_KEY = 'agent_token';
const PROFILE_KEY = 'agent_profile';
const storage = () => typeof localStorage === 'undefined' ? null : localStorage;

@Injectable({ providedIn: 'root' })
export class AgentAuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private _loggedIn = signal<boolean>(!!storage()?.getItem(TOKEN_KEY));
  private _profile = signal<AgentProfile | null>(this.readStoredProfile());

  loggedIn = this._loggedIn.asReadonly();
  profile = this._profile.asReadonly();

  login(payload: AgentLoginPayload): Observable<AgentAuthResponse> {
    return this.http.post<AgentAuthResponse>(`${this.baseUrl}/api/auth/login`, payload).pipe(
      tap((res) => {
        storage()?.setItem(TOKEN_KEY, res.token);
        storage()?.setItem(PROFILE_KEY, JSON.stringify(res.agent));
        this._loggedIn.set(true);
        this._profile.set(res.agent);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/agent/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  refreshMe(): Observable<AgentProfile> {
    return this.http.get<AgentProfile>(`${this.baseUrl}/api/agent/me`).pipe(
      tap((agent) => {
        storage()?.setItem(PROFILE_KEY, JSON.stringify(agent));
        this._profile.set(agent);
      })
    );
  }

  isLoggedIn(): boolean {
    return this._loggedIn();
  }

  getToken(): string | null {
    return storage()?.getItem(TOKEN_KEY) ?? null;
  }

  private clearSession() {
    storage()?.removeItem(TOKEN_KEY);
    storage()?.removeItem(PROFILE_KEY);
    this._loggedIn.set(false);
    this._profile.set(null);
  }

  private readStoredProfile(): AgentProfile | null {
    const raw = storage()?.getItem(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AgentProfile;
    } catch {
      storage()?.removeItem(PROFILE_KEY);
      return null;
    }
  }
}
