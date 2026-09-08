import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Topbar } from '../../layout/topbar/topbar';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { Icon } from '../../shared/icon/icon';
import { DemandesStore } from '../../shared/data/demandes.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Topbar, StatCard, StatusBadge, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private store = inject(DemandesStore);

  stats = this.store.stats;
  demandes = () => this.store.recentes().slice(0, 8);

  ngOnInit(): void {
    this.store.refresh();
  }

  ouvrir(id: string) {
    this.router.navigate(['/mairie/demandes', id]);
  }

  voirTout() {
    this.router.navigate(['/mairie/demandes']);
  }
}
