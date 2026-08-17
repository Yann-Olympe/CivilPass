import { Injectable, computed, signal } from '@angular/core';
import { Demande, StatCard, StatutDemande } from '../models/demande.model';
import { DEMANDES_RECENTES } from './mock-data';

const PENDING_STATUTS: StatutDemande[] = ['nouvelle', 'en_cours', 'urgente'];

@Injectable({ providedIn: 'root' })
export class DemandesStore {
  private readonly _demandes = signal<Demande[]>(DEMANDES_RECENTES);

  readonly demandes = this._demandes.asReadonly();

  readonly recentes = computed(() =>
    [...this._demandes()].sort((a, b) => b.soumisLe - a.soumisLe)
  );

  readonly nouvelles = computed(() => this.parStatut('nouvelle'));
  readonly enCours = computed(() => this.parStatut('en_cours'));
  readonly validees = computed(() => this.parStatut('validee'));
  readonly rejetees = computed(() => this.parStatut('rejetee'));
  readonly correctionsDemandees = computed(() => this.parStatut('correction_demandee'));
  readonly urgentes = computed(() => this.parStatut('urgente'));

  readonly fileAttente = computed(() =>
    this._demandes()
      .filter((d) => PENDING_STATUTS.includes(d.statut))
      .sort((a, b) => a.soumisLe - b.soumisLe)
  );

  readonly stats = computed<StatCard[]>(() => {
    const all = this._demandes();
    const nouvelles = all.filter((d) => d.statut === 'nouvelle').length;
    const enCours = all.filter((d) => d.statut === 'en_cours' || d.statut === 'urgente').length;
    const aTraiter = all.filter(
      (d) => d.statut === 'urgente' || d.statut === 'correction_demandee'
    ).length;
    const validees = all.filter((d) => d.statut === 'validee').length;
    const rejetees = all.filter((d) => d.statut === 'rejetee').length;

    return [
      {
        label: 'Nouvelles demandes',
        value: String(nouvelles),
        icon: 'file',
        iconBg: 'red',
        footer: `${nouvelles} en attente d'ouverture`,
        footerTone: 'neutral',
      },
      {
        label: 'En cours de vérification',
        value: String(enCours),
        icon: 'hourglass',
        iconBg: 'yellow',
        footer: aTraiter > 0 ? `Action requise sur ${aTraiter}` : 'Aucune action urgente',
        footerTone: aTraiter > 0 ? 'warn' : 'neutral',
      },
      {
        label: 'Demandes validées',
        value: String(validees),
        icon: 'shield-check',
        iconBg: 'green',
        footer: 'Ce mois-ci',
        footerTone: 'neutral',
      },
      {
        label: 'Demandes rejetées',
        value: String(rejetees),
        icon: 'archive',
        iconBg: 'gray',
        footer: 'Ce mois-ci',
        footerTone: rejetees > 0 ? 'warn' : 'neutral',
      },
    ];
  });

  private parStatut(statut: StatutDemande) {
    return computed(() => this._demandes().filter((d) => d.statut === statut))();
  }

  getById(id: string): Demande | undefined {
    return this._demandes().find((d) => d.id === id);
  }

  prochaineAVerifier(): Demande | undefined {
    return this.fileAttente()[0];
  }

  valider(id: string) {
    this.update(id, { statut: 'validee', motifRejet: undefined, motifCorrection: undefined });
  }

  rejeter(id: string, motif: string) {
    this.update(id, { statut: 'rejetee', motifRejet: motif });
  }

  demanderCorrection(id: string, motif: string) {
    this.update(id, { statut: 'correction_demandee', motifCorrection: motif });
  }

  private update(id: string, patch: Partial<Demande>) {
    this._demandes.update((list) =>
      list.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }
}
