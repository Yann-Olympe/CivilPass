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
      nouvelle: 'À vérifier par la mairie d’origine',
      en_cours: 'Réception en attente',
      validee: 'Réceptionnée par la mairie de retrait',
      remise: 'Remise au citoyen',
      urgente: 'Urgente',
      rejetee: 'Rejetée',
      correction_demandee: 'Correction demandée',
      en_attente: 'En attente',
      valide: 'Validé à l’origine — réception en attente',
      recu: 'Réceptionné',
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
      remise: 'green',
      urgente: 'red',
      rejetee: 'red',
      correction_demandee: 'yellow',
      nouveau: 'yellow',
      a_preparer: 'gray',
      pret: 'green',
      en_attente: 'yellow',
      valide: 'yellow',
      recu: 'green',
    };
    return map[this.statut()] ?? 'gray';
  });
}
