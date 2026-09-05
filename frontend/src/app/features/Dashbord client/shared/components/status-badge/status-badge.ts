import { Component, computed, input } from '@angular/core';
import { CLIENT_STATUT_LABELS, ClientDemandeStatut } from '../../models/client-demande.model';

@Component({
  selector: 'app-client-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class ClientStatusBadge {
  statut = input.required<ClientDemandeStatut>();

  label = computed(() => CLIENT_STATUT_LABELS[this.statut()] ?? this.statut());

  tone = computed(() => {
    const map: Record<ClientDemandeStatut, string> = {
      pret: 'green',
      en_cours: 'yellow',
      a_preparer: 'gray',
      validee: 'blue',
      rejetee: 'red',
      correction_demandee: 'orange',
    };
    return map[this.statut()] ?? 'gray';
  });
}
