import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { CitizenAuthService } from './citizen-auth.service';
import { citizenAuthGuard } from '../core/guards/citizen-auth.guard';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'civilpass_citoyen_token';
const USAGER_KEY = 'civilpass_citoyen_usager';
const AGENT_TOKEN_KEY = 'agent_token';
const PREFERENCE_KEY = 'civilpass_test_preference';

describe('CitizenAuthService logout and citizen guard', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USAGER_KEY);
    localStorage.removeItem(AGENT_TOKEN_KEY);
    localStorage.removeItem(PREFERENCE_KEY);
  });

  it('revokes the server session and clears only citizen authentication data', async () => {
    localStorage.setItem(TOKEN_KEY, 'citizen-token');
    localStorage.setItem(USAGER_KEY, '{"id":1}');
    localStorage.setItem(AGENT_TOKEN_KEY, 'agent-token');
    localStorage.setItem(PREFERENCE_KEY, 'keep');
    const auth = TestBed.inject(CitizenAuthService);
    let result: { message: string } | undefined;

    auth.logout().subscribe((response) => (result = response));

    expect(auth.deconnexionEnCours()).toBe(true);
    const request = http.expectOne(`${environment.apiUrl}/api/citoyen/logout`);
    expect(request.request.method).toBe('POST');
    request.flush({ message: 'Déconnecté.' });

    expect(result?.message).toBe('Déconnecté.');
    expect(auth.deconnexionEnCours()).toBe(false);
    expect(auth.estConnecte()).toBe(false);
    expect(auth.usager()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USAGER_KEY)).toBeNull();
    expect(localStorage.getItem(AGENT_TOKEN_KEY)).toBe('agent-token');
    expect(localStorage.getItem(PREFERENCE_KEY)).toBe('keep');
  });

  it('clears the local session when the logout request fails', async () => {
    localStorage.setItem(TOKEN_KEY, 'citizen-token');
    localStorage.setItem(USAGER_KEY, '{"id":1}');
    const auth = TestBed.inject(CitizenAuthService);
    const logout = firstValueFrom(auth.logout());

    const request = http.expectOne(`${environment.apiUrl}/api/citoyen/logout`);
    request.flush({}, { status: 500, statusText: 'Server Error' });

    await expect(logout).rejects.toBeTruthy();
    expect(auth.deconnexionEnCours()).toBe(false);
    expect(auth.estConnecte()).toBe(false);
    expect(auth.usager()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USAGER_KEY)).toBeNull();
  });

  it('rejects a protected route when the citizen token is absent', () => {
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      citizenAuthGuard({} as never, { url: '/espace' } as never)
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
    http.expectNone(`${environment.apiUrl}/api/citoyen/me`);
  });

  it('keeps a valid stored session when the API confirms it', async () => {
    localStorage.setItem(TOKEN_KEY, 'citizen-token');
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      citizenAuthGuard({} as never, { url: '/espace' } as never)
    );
    const guardResult = firstValueFrom(result as Observable<boolean | UrlTree>);

    http.expectOne(`${environment.apiUrl}/api/citoyen/me`).flush({ id: 1 });

    expect(await guardResult).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('citizen-token');
    expect(router.url).not.toContain('/login');
  });

  it('clears an invalid token and rejects the protected route', async () => {
    localStorage.setItem(TOKEN_KEY, 'invalid-token');
    localStorage.setItem(USAGER_KEY, '{"id":1}');
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      citizenAuthGuard({} as never, { url: '/espace' } as never)
    );
    const guardResult = firstValueFrom(result as Observable<boolean | UrlTree>);

    http
      .expectOne(`${environment.apiUrl}/api/citoyen/me`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(router.serializeUrl((await guardResult) as UrlTree)).toContain('/login');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USAGER_KEY)).toBeNull();
  });
});
