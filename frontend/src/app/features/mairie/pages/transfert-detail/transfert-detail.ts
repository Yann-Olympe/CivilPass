import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { DemandesStore } from '../../shared/data/demandes.store';

@Component({
  selector: 'app-transfert-detail',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './transfert-detail.html',
  styleUrl: './transfert-detail.css',
})
export class TransfertDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(DemandesStore);

  demandeId = this.route.snapshot.paramMap.get('id') ?? '';

  demande = computed(() => this.store.getById(this.demandeId));

  constructor() {
    if (!this.demande()) {
      this.router.navigate(['/transferts']);
    }
  }
}