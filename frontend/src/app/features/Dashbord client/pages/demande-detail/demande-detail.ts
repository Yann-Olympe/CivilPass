import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, of, switchMap } from 'rxjs';
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

  demande = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('id') ?? ''),
      switchMap((id) => (id ? this.service.getDemande(id) : of(undefined)))
    ),
    { initialValue: undefined }
  );

  typeIcon = CLIENT_TYPE_ICON;
  confirmRetraitOpen = signal(false);
  telechargementEnCours = signal(false);

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
    if (!demande || this.telechargementEnCours()) return;

    this.telechargementEnCours.set(true);
    this.service
      .telechargerRecepisse(demande.id)
      .pipe(finalize(() => this.telechargementEnCours.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recepisse-${demande.reference}.pdf`;
          a.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.toast.show('Récépissé PDF téléchargé.', 'success');
        },
        error: () => this.toast.show('Impossible de télécharger le récépissé. Réessayez.', 'danger'),
      });
  }

  refaireDemande(): void {
    this.router.navigate(['/demande/identite']);
  }
}
