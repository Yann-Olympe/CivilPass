import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { Icon } from '../../shared/icon/icon';
import { ClientStatusBadge } from '../../shared/components/status-badge/status-badge';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { ClientDemandesService } from '../../shared/services/client-demandes.service';
import { ClientToastService } from '../../shared/services/client-toast.service';
import { CLIENT_TYPE_ICON } from '../../shared/models/client-demande.model';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [Icon, ClientStatusBadge, ConfirmModal],
  templateUrl: './demande-detail.html',
  styleUrl: './demande-detail.css',
})
export class DemandeDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ClientDemandesService);
  private toast = inject(ClientToastService);

  private id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), { initialValue: '' });

  demande = computed(() => this.service.getById(this.id()));
  typeIcon = CLIENT_TYPE_ICON;

  confirmRetraitOpen = signal(false);

  retour(): void {
    this.router.navigate(['/espace/demandes']);
  }

  ouvrirConfirmationRetrait(): void {
    this.confirmRetraitOpen.set(true);
  }

  annulerConfirmationRetrait(): void {
    this.confirmRetraitOpen.set(false);
  }

  confirmerRetrait(): void {
    const demande = this.demande();
    if (!demande) return;

    this.service.confirmerRetrait(demande.id);
    this.confirmRetraitOpen.set(false);
    this.toast.show('Retrait confirmé. Merci de votre confiance !', 'success');
  }

  telechargerRecepisse(): void {
    const demande = this.demande();
    if (!demande) return;

    const contenu = [
      'CivilPass — Récépissé de demande',
      '--------------------------------',
      `Référence : ${demande.reference}`,
      `Type de document : ${demande.titre}`,
      `Mairie de retrait : ${demande.mairieRetrait}`,
      `Date de la demande : ${demande.dateCreation}`,
      `Statut actuel : ${demande.statut}`,
    ].join('\n');

    const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recepisse-${demande.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.toast.show('Récépissé téléchargé.', 'info');
  }

  refaireDemande(): void {
    this.router.navigate(['/demande/identite']);
  }
}
