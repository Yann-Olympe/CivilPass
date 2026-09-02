import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AgentLoginPayload, AgentAuthResponse, AgentProfile } from '../core/models/agent-auth.model';

const TOKEN_KEY = 'agent_token';
const PROFILE_KEY = 'agent_profile';

@Injectable({ providedIn: 'root' })
export class AgentAuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private _loggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  private _profile = signal<AgentProfile | null>(this.readStoredProfile());

  loggedIn = this._loggedIn.asReadonly();
  profile = this._profile.asReadonly();

  login(payload: AgentLoginPayload): Observable<AgentAuthResponse> {
    return this.http.post<AgentAuthResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(res.agent));
        this._loggedIn.set(true);
        this._profile.set(res.agent);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/agent/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  refreshMe(): Observable<AgentProfile> {
    return this.http.get<AgentProfile>(`${this.baseUrl}/agent/me`).pipe(
      tap((agent) => {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(agent));
        this._profile.set(agent);
      })
    );
  }

  isLoggedIn(): boolean {
    return this._loggedIn();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    this._loggedIn.set(false);
    this._profile.set(null);
  }

  private readStoredProfile(): AgentProfile | null {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}