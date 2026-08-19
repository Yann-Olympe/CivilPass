import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { DemandesStore } from '../../shared/data/demandes.store';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ChampRegistre, Demande, DetailDemande } from '../../shared/models/demande.model';

type PanelAction = null | 'reject' | 'correction';

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

  demandeId = '';
  demande = signal<Demande | undefined>(undefined);
  panelAction = signal<PanelAction>(null);
  motif = signal('');

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
    return s === 'validee' || s === 'rejetee';
  });

  statutMeta = computed(() => {
    const s = this.demande()?.statut;
    switch (s) {
      case 'validee':
        return { label: 'Demande validée', tone: 'green' as const };
      case 'rejetee':
        return { label: 'Demande rejetée', tone: 'red' as const };
      case 'correction_demandee':
        return { label: 'Correction demandée au citoyen', tone: 'yellow' as const };
      case 'urgente':
        return { label: 'En attente de vérification — urgente', tone: 'red' as const };
      default:
        return { label: 'En attente de vérification', tone: 'yellow' as const };
    }
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id') ?? '';

    if (idParam === 'nouvelle') {
      const prochaine = this.store.prochaineAVerifier();
      if (prochaine) {
        this.router.navigate(['/demandes', prochaine.id], { replaceUrl: true });
        this.charger(prochaine.id);
      } else {
        this.toast.show('Aucune demande en attente de vérification pour le moment.', 'info');
        this.router.navigate(['/tableau-de-bord'], { replaceUrl: true });
      }
      return;
    }

    this.charger(idParam);
  }

  private charger(id: string) {
    this.demandeId = id;
    this.demande.set(this.store.getById(id));
  }

  ouvrirPanneau(action: PanelAction) {
    this.motif.set('');
    this.panelAction.set(this.panelAction() === action ? null : action);
  }

  fermerPanneau() {
    this.panelAction.set(null);
    this.motif.set('');
  }

  confirmerRejet() {
    if (!this.motif().trim()) return;
    this.store.rejeter(this.demandeId, this.motif().trim());
    this.toast.show(`Demande ${this.demandeId} rejetée.`, 'danger');
    this.panelAction.set(null);
    this.router.navigate(['/rejetees']);
  }

  confirmerCorrection() {
    if (!this.motif().trim()) return;
    this.store.demanderCorrection(this.demandeId, this.motif().trim());
    this.toast.show(`Correction demandée pour ${this.demandeId}.`, 'info');
    this.panelAction.set(null);
    this.router.navigate(['/tableau-de-bord']);
  }

  valider() {
    this.store.valider(this.demandeId);
    this.toast.show(`Demande ${this.demandeId} validée avec succès.`, 'success');
    this.router.navigate(['/transferts', this.demandeId]);
  }
}
