import { Injectable, computed, signal, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { Demande, StatCard, StatutDemande } from '../models/demande.model';
import { AgentDemandeService } from '../../../../Services/agentDemande.service';
import { mapAgentDemandeDto } from '../../../../core/utils/agent-demande.mapper';

const PENDING_STATUTS: StatutDemande[] = ['nouvelle', 'en_cours', 'urgente'];

@Injectable({ providedIn: 'root' })
export class DemandesStore {
  private agentDemandeService = inject(AgentDemandeService);

  private readonly _demandes = signal<Demande[]>([]);
  private readonly _isLoading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly demandes = this._demandes.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.chargerDemandes();
  }

  private chargerDemandes() {
    this._isLoading.set(true);
    this._error.set(null);
    this.agentDemandeService.getDemandes().subscribe({
      next: (dtos) => {
        this._demandes.set(dtos.map(mapAgentDemandeDto));
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this._error.set('Impossible de charger les demandes.');
        this._isLoading.set(false);
      },
    });
  }

  refresh() {
    this.chargerDemandes();
  }

  readonly recentes = computed(() =>
    [...this._demandes()].sort((a, b) => b.soumisLe - a.soumisLe)
  );

  readonly nouvelles = computed(() => this.parStatut('nouvelle'));
  readonly enCours = computed(() => this.parStatut('en_cours'));
  readonly validees = computed(() => this.parStatut('validee'));
  readonly urgentes = computed(() => this.parStatut('urgente'));
  readonly rejetees = computed(() => this.parStatut('rejetee'));
  readonly correctionsDemandees = computed(() => this.parStatut('correction_demandee'));

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
      { label: 'Nouvelles demandes', value: String(nouvelles), icon: 'file', iconBg: 'red', footer: `${nouvelles} en attente d'ouverture`, footerTone: 'neutral' },
      { label: 'En cours de vérification', value: String(enCours), icon: 'hourglass', iconBg: 'yellow', footer: aTraiter > 0 ? `Action requise sur ${aTraiter}` : 'Aucune action urgente', footerTone: aTraiter > 0 ? 'warn' : 'neutral' },
      { label: 'Demandes validées', value: String(validees), icon: 'shield-check', iconBg: 'green', footer: 'Ce mois-ci', footerTone: 'neutral' },
      { label: 'Demandes rejetées', value: String(rejetees), icon: 'archive', iconBg: 'gray', footer: 'Ce mois-ci', footerTone: rejetees > 0 ? 'warn' : 'neutral' },
    ];
  });

  private parStatut(statut: StatutDemande) {
    return computed(() => this._demandes().filter((d) => d.statut === statut))();
  }

  getById(id: string): Demande | undefined {
    return this._demandes().find((d) => d.id === id);
  }

  prochaineAVerifier(mairieId?: number): Demande | undefined {
    if (mairieId === undefined) return undefined;

    return this._demandes()
      .filter(
        (demande) =>
          demande.mairieOrigineId === mairieId &&
          (demande.statut === 'nouvelle' || demande.statut === 'urgente')
      )
      .sort((a, b) => a.soumisLe - b.soumisLe)[0];
  }

  valider(id: string, motif?: string): Observable<Demande> {
    return this.agentDemandeService.valider(id, {
      souche_retrouvee: true,
      motif,
    }).pipe(
      map(mapAgentDemandeDto),
      tap((demande) => this.update(id, demande))
    );
  }

  recevoir(id: string): Observable<Demande> {
    return this.agentDemandeService.recevoir(id).pipe(
      map(mapAgentDemandeDto),
      tap((demande) => this.update(id, demande))
    );
  }

  remettre(id: string): Observable<Demande> {
    return this.agentDemandeService.remettre(id).pipe(
      map(mapAgentDemandeDto),
      tap((demande) => this.update(id, demande))
    );
  }

  rejeter(id: string, motif: string): Observable<Demande> {
    return this.agentDemandeService.valider(id, {
      souche_retrouvee: false,
      motif,
    }).pipe(
      map(mapAgentDemandeDto),
      tap((demande) => this.update(id, demande))
    );
  }

  demanderCorrection(id: string, motif: string): Observable<Demande> {
    return this.agentDemandeService.demanderCorrection(id, motif).pipe(
      map(mapAgentDemandeDto),
      tap((demande) => this.update(id, demande))
    );
  }

  private update(id: string, patch: Partial<Demande>) {
    this._demandes.update((list) =>
      list.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }
}
