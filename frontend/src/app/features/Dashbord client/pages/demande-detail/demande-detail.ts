import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, of, switchMap } from 'rxjs';
import { Icon } from '../../shared/icon/icon';
import { ClientStatusBadge } from '../../shared/components/status-badge/status-badge';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { ClientDemandesService } from '../../shared/services/client-demandes.service';
import { ClientToastService } from '../../shared/services/client-toast.service';
import { CLIENT_TYPE_ICON, ClientDemande } from '../../shared/models/client-demande.model';

type CorrectionForm = {
  numeroActe: string;
  anneeActe: string;
  pereNom: string;
  mereNom: string;
};

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

  private demandeChargee = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('id') ?? ''),
      switchMap((id) => (id ? this.service.getDemande(id) : of(undefined)))
    ),
    { initialValue: undefined }
  );
  private demandeMiseAJour = signal<ClientDemande | undefined>(undefined);
  demande = computed(() => this.demandeMiseAJour() ?? this.demandeChargee());

  typeIcon = CLIENT_TYPE_ICON;
  confirmRetraitOpen = signal(false);
  telechargementEnCours = signal(false);
  confirmationRetraitEnCours = signal(false);
  correctionEnCours = signal(false);
  correctionForm = signal<CorrectionForm>({
    numeroActe: '',
    anneeActe: '',
    pereNom: '',
    mereNom: '',
  });
  private correctionInitialiseePour = '';
  anneeCourante = new Date().getFullYear();

  peutSoumettreCorrection = computed(() => {
    const formulaire = this.correctionForm();
    const annee = Number(formulaire.anneeActe);
    return Boolean(
      formulaire.numeroActe.trim() &&
      Number.isInteger(annee) &&
      annee >= 1900 &&
      annee <= this.anneeCourante
    );
  });

  constructor() {
    effect(() => {
      const demande = this.demande();
      if (demande?.statut === 'correction_demandee' && this.correctionInitialiseePour !== demande.id) {
        this.correctionForm.set({
          numeroActe: demande.numeroActe ?? '',
          anneeActe: demande.anneeActe?.toString() ?? '',
          pereNom: demande.pereNom ?? '',
          mereNom: demande.mereNom ?? '',
        });
        this.correctionInitialiseePour = demande.id;
      }
    });
  }

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
    if (!demande || this.confirmationRetraitEnCours()) return;

    this.confirmationRetraitEnCours.set(true);
    this.service
      .confirmerRetrait(demande.id)
      .pipe(finalize(() => this.confirmationRetraitEnCours.set(false)))
      .subscribe({
        next: (demandeMiseAJour) => {
          this.demandeMiseAJour.set(demandeMiseAJour);
          this.confirmRetraitOpen.set(false);
          this.toast.show('Retrait confirmé avec succès.', 'success');
        },
        error: (error: { status?: number }) => {
          const message =
            error.status === 0
              ? 'Connexion impossible. Le retrait n’a pas pu être confirmé.'
              : error.status === 401 || error.status === 403
                ? 'Vous n’êtes pas autorisé à confirmer ce retrait.'
                : error.status === 404
                  ? 'Cette demande est introuvable.'
                  : error.status === 409
                    ? 'Cette demande ne peut plus être confirmée comme retirée. Actualisez son état.'
                    : 'Le retrait n’a pas pu être confirmé. Réessayez.';
          this.toast.show(message, 'danger');
        },
      });
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
    this.router.navigate(['/demande/acte']);
  }

  modifierCorrection(champ: keyof CorrectionForm, valeur: string): void {
    this.correctionForm.update((formulaire) => ({ ...formulaire, [champ]: valeur }));
  }

  resoumettreCorrection(): void {
    const demande = this.demande();
    const formulaire = this.correctionForm();
    if (
      !demande ||
      demande.statut !== 'correction_demandee' ||
      this.correctionEnCours() ||
      !this.peutSoumettreCorrection()
    ) {
      return;
    }

    this.correctionEnCours.set(true);
    this.service
      .soumettreCorrection(demande.id, {
        numero_acte: formulaire.numeroActe.trim(),
        annee_acte: Number(formulaire.anneeActe),
        filiation: {
          pere_nom: formulaire.pereNom.trim(),
          mere_nom: formulaire.mereNom.trim(),
        },
      })
      .pipe(finalize(() => this.correctionEnCours.set(false)))
      .subscribe({
        next: (demandeMiseAJour) => {
          this.demandeMiseAJour.set(demandeMiseAJour);
          this.toast.show('Vos corrections ont été envoyées à la mairie d’origine.', 'success');
        },
        error: (error: { status?: number }) => {
          const message =
            error.status === 0
              ? 'Connexion impossible. Vos corrections n’ont pas été envoyées.'
              : error.status === 404
                ? 'Cette demande est introuvable.'
                : error.status === 409
                  ? 'Cette demande n’attend plus de correction. Actualisez son état.'
                  : error.status === 422
                    ? 'Vérifiez le numéro et l’année de l’acte avant de réessayer.'
                    : 'Vos corrections n’ont pas pu être envoyées. Réessayez.';
          this.toast.show(message, 'danger');
        },
      });
  }
}
