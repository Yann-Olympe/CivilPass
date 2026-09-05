import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon } from '../../shared/icon/icon';
import { ClientUserService } from '../../shared/services/client-user.service';
import { ClientToastService } from '../../shared/services/client-toast.service';
import { CitizenAuthService } from '../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './mon-profil.html',
  styleUrl: './mon-profil.css',
})
export class MonProfil {
  private fb = inject(FormBuilder);
  private userService = inject(ClientUserService);
  private toast = inject(ClientToastService);
  private auth = inject(CitizenAuthService);
  private router = inject(Router);

  profile = this.userService.profile;
  initiales = this.userService.initiales;
  saving = this.userService.saving;

  mode = signal<'view' | 'edit'>('view');

  form = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.minLength(8)]],
    adresse: ['', [Validators.required]],
    ville: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
  });

  dateNaissanceAffichee = computed(() => {
    const iso = this.profile().dateNaissance;
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  });

  commencerModification(): void {
    this.form.setValue(this.profile());
    this.mode.set('edit');
  }

  annulerModification(): void {
    this.mode.set('view');
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.userService.updateProfile(this.form.getRawValue()).subscribe(() => {
      this.toast.show('Vos informations ont été mises à jour.', 'success');
      this.mode.set('view');
    });
  }

deconnexion(): void {
  this.auth.logout().subscribe({
    next: () => this.router.navigate(['/login']),
    error: () => this.router.navigate(['/login']), // on déconnecte localement même si le réseau échoue
  });
}
}
