import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { ClientDemandesService } from '../../shared/services/client-demandes.service';
import { CLIENT_STATUT_LABELS, ClientDemandeStatut } from '../../shared/models/client-demande.model';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [Icon],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css',
})
export class Statistiques {
  private router = inject(Router);
  private service = inject(ClientDemandesService);

  statutLabels = CLIENT_STATUT_LABELS;

  statsMensuelles = this.service.statistiquesMensuelles;
  repartition = this.service.repartitionParStatut;

  maxMensuel = computed(() => Math.max(1, ...this.statsMensuelles().map((m) => m.total)));
  maxRepartition = computed(() => Math.max(1, ...this.repartition().map((r) => r.total)));

  toneFor(statut: ClientDemandeStatut): string {
    const map: Record<ClientDemandeStatut, string> = {
      pret: 'green',
      en_cours: 'yellow',
      a_preparer: 'gray',
      validee: 'blue',
      rejetee: 'red',
      correction_demandee: 'orange',
    };
    return map[statut];
  }

  retour(): void {
    this.router.navigate(['/espace']);
  }
}
