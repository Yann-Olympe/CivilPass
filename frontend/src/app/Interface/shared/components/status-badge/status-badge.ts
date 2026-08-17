import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css'
})
export class StatusBadge {
  statut = input.required<string>();

  label = computed(() => {
    const map: Record<string, string> = {
      nouvelle: 'Nouvelle',
      en_cours: 'En cours',
      validee: 'Validée',
      urgente: 'Urgente',
      rejetee: 'Rejetée',
      correction_demandee: 'Correction demandée',
      nouveau: 'Nouveau',
      a_preparer: 'À préparer',
      pret: 'Prêt pour retrait',
    };
    return map[this.statut()] ?? this.statut();
  });

  tone = computed(() => {
    const map: Record<string, string> = {
      nouvelle: 'red',
      en_cours: 'yellow',
      validee: 'green',
      urgente: 'red',
      rejetee: 'red',
      correction_demandee: 'yellow',
      nouveau: 'yellow',
      a_preparer: 'gray',
      pret: 'green',
    };
    return map[this.statut()] ?? 'gray';
  });
}
