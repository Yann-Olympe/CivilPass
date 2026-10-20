import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const agentToken = typeof localStorage === 'undefined' ? null : localStorage.getItem('agent_token');
  const citizenToken = typeof localStorage === 'undefined' ? null : localStorage.getItem('civilpass_citoyen_token');

  // Les routes /api/agent/* utilisent le token agent, tout le reste le token citoyen
  const token = req.url.includes('/agent/') ? agentToken : citizenToken;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
