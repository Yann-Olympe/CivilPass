import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CitizenAuthService } from '../../Services/auth.service';

export const citizenAuthGuard: CanActivateFn = () => {
  const auth = inject(CitizenAuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/connexion']);
  return false;
};