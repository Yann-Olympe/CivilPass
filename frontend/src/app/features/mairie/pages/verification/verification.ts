import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { DemandesStore } from '../../shared/data/demandes.store';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ChampRegistre, Demande, DetailDemande } from '../../shared/models/demande.model';
import { AgentAuthService } from '../../../../Services/agent-auth.service';
import { finalize } from 'rxjs';

type PanelAction = null | 'reject' | 'correction';
type DemandeAction = 'reject' | 'correction' | 'validate' | 'receive' | 'deliver';

function detailParDefaut(demande: Demande): DetailDemande {
  const [prenom, ...reste] = demande.citoyen.split(' ');
  const nom = reste.join(' ') || demande.citoyen;
  const slug = demande.citoyen.toLowerCase().replace(/[^a-z]+/g, '.');

  const champs: ChampRegistre[] = [
    { label: 'Nom', declare: nom.toUpperCase(), registre: nom.toUpperCase(), divergence: false },
    { label: 'Prénoms', declare: prenom, registre: prenom, divergence: false },
    { label: 'Année de naissance', declare: String(demande.anneeActe), registre: String(demande.anneeActe), divergence: false },
  ];

  return {
    demandeur: {
      nomComplet: demande.citoyen,
      numeroCni: '—',
      telephone: '—',
      email: `${slug}@example.cm`,
    },
    acte: {
      type: "Copie Intégrale d'Acte de Naissance",
      numero: `AN-${demande.anneeActe}-${demande.id.slice(-4)}`,
      dateLieu: `Année ${demande.anneeActe}, ${demande.mairieRetrait}`,
    },
    champs,
  };
}

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './verification.html',
  styleUrl: './verification.css',
})
export class Verification {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(DemandesStore);
  private toast = inject(ToastService);
  private agentAuth = inject(AgentAuthService);

  demandeId = '';
  demande = signal<Demande | undefined>(undefined);
  panelAction = signal<PanelAction>(null);
  motif = signal('');
  private actionEnCours = signal<DemandeAction | null>(null);
  rejetEnCours = computed(() => this.actionEnCours() === 'reject');
  correctionEnCours = computed(() => this.actionEnCours() === 'correction');
  validationEnCours = computed(() => this.actionEnCours() === 'validate');
  receptionEnCours = computed(() => this.actionEnCours() === 'receive');
  remiseEnCours = computed(() => this.actionEnCours() === 'deliver');
  uneActionEnCours = computed(() => this.actionEnCours() !== null);

  isMairieRetrait = () => {
    const agentMairieId = this.agentAuth.profile()?.mairie_id;
    const mairieRetraitId = this.demande()?.mairieRetraitId;
    return agentMairieId !== undefined && agentMairieId === mairieRetraitId;
  };

  isMairieOrigine = () => {
    const agentMairieId = this.agentAuth.profile()?.mairie_id;
    const mairieOrigineId = this.demande()?.mairieOrigineId;
    return agentMairieId !== undefined && agentMairieId === mairieOrigineId;
  };

  peutVerifierDemande = () =>
    this.isMairieOrigine() &&
    (this.demande()?.statut === 'nouvelle' || this.demande()?.statut === 'urgente');

  peutReceptionner = () =>
    this.isMairieRetrait() &&
    this.demande()?.transfertStatut === 'valide' &&
    (this.demande()?.statut === 'en_cours' || this.demande()?.statut === 'urgente');

  detail = computed<DetailDemande>(() => {
    const d = this.demande();
    return d?.detail ?? (d ? detailParDefaut(d) : detailParDefaut({
      id: '', citoyen: '—', anneeActe: 0, mairieRetrait: '—', date: '', soumisLe: 0, statut: 'nouvelle',
    }));
  });

  demandeur = computed(() => this.detail().demandeur);
  acte = computed(() => this.detail().acte);
  champs = computed(() => this.detail().champs);

  estFinalisee = computed(() => {
    const s = this.demande()?.statut;
    return s === 'validee' || s === 'rejetee' || s === 'remise';
  });

  statutMeta = computed(() => {
    const s = this.demande()?.statut;
    switch (s) {
      case 'validee':
        return { label: 'Demande validée', tone: 'green' as const };
      case 'remise':
        return { label: 'Document remis au citoyen', tone: 'green' as const };
      case 'rejetee':
        return { label: 'Demande rejetée', tone: 'red' as const };
      case 'correction_demandee':
        return { label: 'Correction demandée au citoyen', tone: 'yellow' as const };
      case 'urgente':
        if (this.demande()?.transfertStatut === 'valide') {
          return { label: 'Transfert en attente de réception — priorité urgente', tone: 'red' as const };
        }
        return { label: 'En attente de vérification — urgente', tone: 'red' as const };
      default:
        return { label: 'En attente de vérification', tone: 'yellow' as const };
    }
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id') ?? '';

    if (idParam === 'nouvelle') {
      const prochaine = this.store.prochaineAVerifier(this.agentAuth.profile()?.mairie_id);
      if (prochaine) {
        this.router.navigate(['/mairie/demandes', prochaine.id], { replaceUrl: true });
        this.charger(prochaine.id);
      } else {
        this.toast.show('Aucune demande en attente de vérification pour le moment.', 'info');
        this.router.navigate(['/mairie/tableau-de-bord'], { replaceUrl: true });
      }
      return;
    }

    this.charger(idParam);
    effect(() => {
      const demandeChargee = this.store.demandes().find((demande) => demande.id === idParam);
      if (demandeChargee) this.demande.set(demandeChargee);
    });
  }

  private charger(id: string) {
    this.demandeId = id;
    this.demande.set(this.store.getById(id));
  }

  ouvrirPanneau(action: PanelAction) {
    if (this.uneActionEnCours()) return;
    this.motif.set('');
    this.panelAction.set(this.panelAction() === action ? null : action);
  }

  fermerPanneau() {
    if (this.uneActionEnCours()) return;
    this.panelAction.set(null);
    this.motif.set('');
  }

  confirmerRejet() {
    const motif = this.motif().trim();
    if (!motif || this.uneActionEnCours()) return;

    this.actionEnCours.set('reject');
    this.store.rejeter(this.demandeId, motif)
      .pipe(finalize(() => this.actionEnCours.set(null)))
      .subscribe({
        next: () => {
          this.toast.show(`Demande ${this.demandeId} rejetée.`, 'success');
          this.panelAction.set(null);
          this.router.navigate(['/mairie/rejetees']);
        },
        error: (error: { status?: number }) => {
          this.toast.show(this.messageErreurAction(error, 'reject'), 'danger');
        },
      });
  }

  confirmerCorrection() {
    const motif = this.motif().trim();
    if (!motif || this.uneActionEnCours()) return;

    this.actionEnCours.set('correction');
    this.store.demanderCorrection(this.demandeId, motif)
      .pipe(finalize(() => this.actionEnCours.set(null)))
      .subscribe({
        next: () => {
          this.toast.show('La demande de correction a été envoyée au citoyen.', 'success');
          this.fermerPanneau();
        },
        error: (error: { status?: number }) => {
          this.toast.show(this.messageErreurAction(error, 'correction'), 'danger');
        },
      });
  }

  valider() {
    if (this.uneActionEnCours()) return;
    this.actionEnCours.set('validate');
    this.store.valider(this.demandeId)
      .pipe(finalize(() => this.actionEnCours.set(null)))
      .subscribe({
        next: (demande) => {
          this.toast.show(`Demande ${this.demandeId} validée avec succès.`, 'success');
          this.router.navigate(
            demande.transfertId
              ? ['/mairie/transferts', demande.transfertId]
              : ['/mairie/transferts']
          );
        },
        error: (error: { status?: number }) =>
          this.toast.show(this.messageErreurAction(error, 'validate'), 'danger'),
      });
  }

  recevoir() {
    if (this.uneActionEnCours()) return;
    this.actionEnCours.set('receive');
    this.store.recevoir(this.demandeId)
      .pipe(finalize(() => this.actionEnCours.set(null)))
      .subscribe({
        next: () => {
          this.toast.show(`Demande ${this.demandeId} réceptionnée.`, 'success');
          this.router.navigate(['/mairie/demandes', this.demandeId]);
        },
        error: (error: { status?: number }) =>
          this.toast.show(this.messageErreurAction(error, 'receive'), 'danger'),
      });
  }

  remettre() {
    if (this.uneActionEnCours()) return;
    this.actionEnCours.set('deliver');
    this.store.remettre(this.demandeId)
      .pipe(finalize(() => this.actionEnCours.set(null)))
      .subscribe({
        next: () => {
          this.toast.show(`Demande ${this.demandeId} remise au citoyen.`, 'success');
          this.router.navigate(['/mairie/demandes', this.demandeId]);
        },
        error: (error: { status?: number }) =>
          this.toast.show(this.messageErreurAction(error, 'deliver'), 'danger'),
      });
  }

  private messageErreurAction(error: { status?: number }, action: DemandeAction): string {
    const labels: Record<DemandeAction, string> = {
      reject: 'rejet',
      correction: 'correction',
      validate: 'validation',
      receive: 'réception',
      deliver: 'remise',
    };
    const label = labels[action];

    switch (error.status) {
      case 0:
        return action === 'reject'
          ? 'Connexion impossible. Le rejet n’a pas été enregistré.'
          : action === 'correction'
            ? 'Connexion impossible. La demande de correction n’a pas été envoyée.'
            : `Connexion impossible. L’action « ${label} » n’a pas été confirmée.`;
      case 400:
      case 422:
        return `Les informations fournies ne permettent pas de terminer l’action « ${label} ». Vérifiez-les et réessayez.`;
      case 401:
        return 'Votre session a expiré. Connectez-vous à nouveau.';
      case 403:
        return action === 'reject' || action === 'correction' || action === 'validate'
          ? `Seule la mairie d’origine est autorisée à effectuer l’action « ${label} ».`
          : `Vous n’êtes pas autorisé à effectuer l’action « ${label} » sur cette demande.`;
      case 404:
        return 'Cette demande est introuvable. Actualisez la liste.';
      case 409:
        return `Le statut de cette demande ne permet plus l’action « ${label} ». Actualisez son état.`;
      default:
        return `Le serveur n’a pas pu enregistrer l’action « ${label} ». Réessayez plus tard.`;
    }
  }
}
