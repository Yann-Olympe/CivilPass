import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CitizenAuthService } from '../../Services/citizen-auth.service';

export const citizenAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(CitizenAuthService);
  const router = inject(Router);
  const loginUrl = router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });

  if (!auth.getToken()) {
    return loginUrl;
  }

  return auth.me().pipe(
    map(() => true),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.invaliderSession();
        return of(loginUrl);
      }

      return of(true);
    })
  );
};