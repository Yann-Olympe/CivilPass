import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AgentAuthService } from '../../Services/agent-auth.service';

export const agentAuthGuard: CanActivateFn = () => {
  const agentAuth = inject(AgentAuthService);
  const router = inject(Router);

  if (agentAuth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/mairie/connexion']);
  return false;
};