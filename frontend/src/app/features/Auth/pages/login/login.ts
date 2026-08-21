import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../../mairie/shared/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  motDePasseVisible = signal(false);
  envoiEnCours = signal(false);
  secousse = signal(false);
  erreurConnexion = signal(false);
  inscriptionReussie = signal(false);

  formulaire: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.formulaire = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

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

    setTimeout(() => {
      this.envoiEnCours.set(false);
      this.router.navigate(['/tableau-de-bord']);
    }, 900);
  }

  continuerAvecGoogle() {
    this.envoiEnCours.set(true);
    setTimeout(() => {
      this.envoiEnCours.set(false);
      this.router.navigate(['/tableau-de-bord']);
    }, 700);
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
