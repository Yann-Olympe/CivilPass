import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenAuthService } from '../../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private router = inject(Router);
  private citizenAuth = inject(CitizenAuthService);

  onRequest(): void {
    if (this.citizenAuth.estConnecte()) {
      this.router.navigate(['/demande/acte']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onVerification(){
    this.router.navigate(['/accueil']);
  }

}
