import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CitizenAuthService } from '../../Services/citizen-auth.service';

export const citizenAuthGuard: CanActivateFn = () => {
  const auth = inject(CitizenAuthService);
  const router = inject(Router);

  if (auth.estConnecte()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};