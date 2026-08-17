import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { TRANSFERT_STATS, DOSSIERS_TRANSFERES } from '../../shared/data/mock-data';

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [Icon, StatCard, StatusBadge],
  templateUrl: './transferts-list.html',
  styleUrl: './transferts-list.css'
})
export class TransfertsList {
  stats = TRANSFERT_STATS;
  dossiers = DOSSIERS_TRANSFERES;
  total = 44;

  constructor(private router: Router) {}

  ouvrir(id: string) {
    this.router.navigate(['/transferts', id]);
  }
}
