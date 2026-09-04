import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../mairie/shared/icon/icon';
import { CitizenAuthService } from '../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private citizenAuth = inject(CitizenAuthService);

  motDePasseVisible = signal(false);
  envoiEnCours = signal(false);
  secousse = signal(false);
  erreurConnexion = signal(false);
  messageErreur = signal('Identifiant ou mot de passe incorrect.');
  inscriptionReussie = signal(false);

  formulaire: FormGroup = this.fb.group({
    identifiant: ['', [Validators.required]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.inscriptionReussie.set(this.route.snapshot.queryParamMap.get('inscrit') === '1');
  }

  basculerMotDePasse() {
    this.motDePasseVisible.update((v) => !v);
  }

  soumettre() {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.declencherSecousse();
      return;
    }

    this.envoiEnCours.set(true);
    this.erreurConnexion.set(false);

    const { identifiant, motDePasse } = this.formulaire.getRawValue();

    this.citizenAuth.login(identifiant, motDePasse).subscribe({
      next: () => {
        this.envoiEnCours.set(false);
        this.router.navigate(['/espace']);
      },
      error: (err) => {
        this.envoiEnCours.set(false);
        this.declencherSecousse();
        this.erreurConnexion.set(true);

        if (err.status === 422 && err.error?.errors) {
          const premiere = Object.values(err.error.errors)[0] as string[];
          this.messageErreur.set(premiere[0]);
        } else if (err.status === 401) {
          this.messageErreur.set('Identifiant ou mot de passe incorrect.');
        } else {
          this.messageErreur.set('Une erreur est survenue. Réessayez.');
        }
      },
    });
  }

  private declencherSecousse() {
    this.secousse.set(true);
    setTimeout(() => this.secousse.set(false), 420);
  }

  erreur(champ: string, code: string) {
    const control = this.formulaire.get(champ);
    return !!control && control.touched && control.hasError(code);
  }

  invalide(champ: string) {
    const control = this.formulaire.get(champ);
    return !!control && control.touched && control.invalid;
  }
}