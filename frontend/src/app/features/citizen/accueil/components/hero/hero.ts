import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private router = inject(Router); 

  onRequest(){
    this.router.navigate(['demande/identite']);
  }
  onVerification(){
    this.router.navigate(['/accueil']);
  }

}
