import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-transfert-detail',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './transfert-detail.html',
  styleUrl: './transfert-detail.css'
})
export class TransfertDetail {
  demandeId = '';

  transfert = {
    mairieOrigine: 'Yaoundé I',
    mairieRetrait: 'Douala',
    statutValidation: 'Validée',
    dateValidation: '24 Octobre 2024 à 14h32 (Heure locale)',
    identifiantAgent: 'AG-YDE-7842',
  };

  constructor(private route: ActivatedRoute) {
    this.demandeId = this.route.snapshot.paramMap.get('id') ?? '';
  }
}
