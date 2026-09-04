import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { ClientStatCard, ClientStatCardData } from '../../shared/components/stat-card/stat-card';
import { ClientDemandesService } from '../../shared/services/client-demandes.service';
import { ClientUserService } from '../../shared/services/client-user.service';
import { CLIENT_TYPE_LABEL } from '../../shared/models/client-demande.model';

@Component({
  selector: 'app-espace-home',
  standalone: true,
  imports: [Icon, ClientStatCard, LowerCasePipe],
  templateUrl: './espace-home.html',
  styleUrl: './espace-home.css',
})
export class EspaceHome {
  private router = inject(Router);
  private demandesService = inject(ClientDemandesService);
  private userService = inject(ClientUserService);

  profile = this.userService.profile;
  prochainePrete = computed(() => this.demandesService.prochainePrete());
  typeLabel = CLIENT_TYPE_LABEL;

  stats = computed<ClientStatCardData[]>(() => {
    const s = this.demandesService.stats();
    return [
      {
        label: 'Demandes en cours',
        value: String(s.actives),
        icon: 'clock',
        tone: 'yellow',
        footer: `${s.actives} demande(s) active(s)`,
      },
      {
        label: 'Prêt à retirer',
        value: String(s.pretARetrait),
        icon: 'check-circle',
        tone: 'green',
        footer: `${s.pretARetrait} acte(s) disponible(s)`,
      },
      {
        label: 'Historique complet',
        value: String(s.historique),
        icon: 'folder',
        tone: 'blue',
        footer: `${s.historique} demande(s) au total`,
      },
    ];
  });

  voirDetail(id: string): void {
    this.router.navigate(['/espace/demandes', id]);
  }

  ouvrirFiltre(index: number): void {
    const filtre = index === 0 ? 'actives' : index === 1 ? 'pret' : 'all';
    this.demandesService.setFiltre(filtre);
    this.router.navigate(['/espace/demandes']);
  }

  voirStatistiques(): void {
    this.router.navigate(['/espace/statistiques']);
  }

  nouvelleDemande(): void {
    this.router.navigate(['/demande/identite']);
  }

  voirMesDemandes(): void {
    this.demandesService.setFiltre('all');
    this.router.navigate(['/espace/demandes']);
  }

  voirMonProfil(): void {
    this.router.navigate(['/espace/profil']);
  }
}
