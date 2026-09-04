import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/icon/icon';
import { ClientStatusBadge } from '../../shared/components/status-badge/status-badge';
import { ClientDemandesService, ClientDemandeFiltre } from '../../shared/services/client-demandes.service';
import { CLIENT_TYPE_ICON } from '../../shared/models/client-demande.model';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [FormsModule, Icon, ClientStatusBadge],
  templateUrl: './mes-demandes.html',
  styleUrl: './mes-demandes.css',
})
export class MesDemandes {
  private router = inject(Router);
  private service = inject(ClientDemandesService);

  demandes = this.service.demandesFiltrees;
  recherche = this.service.recherche;
  filtre = this.service.filtre;
  typeIcon = CLIENT_TYPE_ICON;

  tabs: { value: ClientDemandeFiltre; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'actives', label: 'Actives' },
    { value: 'pret', label: 'Prêtes' },
  ];

  onRechercheChange(value: string): void {
    this.service.setRecherche(value);
  }

  setFiltre(filtre: ClientDemandeFiltre): void {
    this.service.setFiltre(filtre);
  }

  ouvrir(id: string): void {
    this.router.navigate(['/espace/demandes', id]);
  }

  nouvelleDemande(): void {
    this.router.navigate(['/demande/identite']);
  }
}
