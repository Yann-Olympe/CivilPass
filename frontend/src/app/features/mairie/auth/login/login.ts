import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentAuthService } from '../../../../Services/agent-auth.service';

@Component({
  selector: 'app-mairie-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class MairieLogin {
  private fb = inject(FormBuilder);
  private agentAuth = inject(AgentAuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.agentAuth.login(this.loginForm.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.router.navigate(['/mairie/tableau-de-bord']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'Email ou mot de passe incorrect.'
            : 'Une erreur est survenue. Réessayez.'
        );
      },
    });
  }
}