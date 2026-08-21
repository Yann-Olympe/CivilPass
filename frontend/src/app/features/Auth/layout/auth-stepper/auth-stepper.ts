import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../mairie/shared/icon/icon';

interface Etape {
  id: number;
  titre: string;
  description: string;
}

@Component({
  selector: 'app-auth-stepper',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './auth-stepper.html',
  styleUrl: './auth-stepper.css'
})
export class AuthStepper {
  etapeCourante = input(1);

  etapes: Etape[] = [
    { id: 1, titre: 'Inscription', description: 'Renseignez vos informations personnelles.' },
    { id: 2, titre: 'Vérification OTP', description: 'Confirmez le code reçu par e-mail.' },
    { id: 3, titre: 'Finalisation', description: 'Accédez à votre espace agent.' },
  ];

  etat(id: number) {
    const courante = this.etapeCourante();
    if (id < courante) return 'done';
    if (id === courante) return 'active';
    return 'upcoming';
  }
}
