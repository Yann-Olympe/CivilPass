import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ClientDemande, ClientDemandeStatut } from '../models/client-demande.model';
import { ApiDemande } from '../../../../Services/api-demande.model';
import { mapperDemandeApiVersClient } from '../../../../core/utils/client-demande.mapper';

export type ClientDemandeFiltre = 'all' | 'actives' | 'pret';

const ACTIVE_STATUTS: ClientDemandeStatut[] = ['en_cours', 'a_preparer'];

export interface ClientDemandesStats {
  actives: number;
  pretARetrait: number;
  historique: number;
}

export interface StatistiqueMois {
  label: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ClientDemandesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/citoyen/demandes`;

  private readonly _demandes = signal<ClientDemande[]>([]);
  private readonly _loading = signal(false);
  private readonly _erreur = signal<string | null>(null);
  private readonly _recherche = signal('');
  private readonly _filtre = signal<ClientDemandeFiltre>('all');

  readonly loading = this._loading.asReadonly();
  readonly erreur = this._erreur.asReadonly();
  readonly recherche = this._recherche.asReadonly();
  readonly filtre = this._filtre.asReadonly();

  readonly demandes = computed(() =>
    [...this._demandes()].sort((a, b) => b.dateCreationTs - a.dateCreationTs)
  );

  readonly stats = computed<ClientDemandesStats>(() => {
    const all = this._demandes();
    return {
      actives: all.filter((d) => ACTIVE_STATUTS.includes(d.statut)).length,
      pretARetrait: all.filter((d) => d.statut === 'pret').length,
      historique: all.length,
    };
  });

  readonly demandesFiltrees = computed(() => {
    const texte = this._recherche().trim().toLowerCase();
    const filtre = this._filtre();

    return this.demandes().filter((d) => {
      const matchTexte =
        !texte ||
        d.titre.toLowerCase().includes(texte) ||
        d.reference.toLowerCase().includes(texte) ||
        d.mairieRetrait.toLowerCase().includes(texte);

      const matchFiltre =
        filtre === 'all' ||
        (filtre === 'actives' && ACTIVE_STATUTS.includes(d.statut)) ||
        (filtre === 'pret' && d.statut === 'pret');

      return matchTexte && matchFiltre;
    });
  });

  readonly statistiquesMensuelles = computed<StatistiqueMois[]>(() => {
    const parMois = new Map<string, number>();

    for (const d of this._demandes()) {
      const date = new Date(d.dateCreationTs);
      const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      parMois.set(label, (parMois.get(label) ?? 0) + 1);
    }

    return [...parMois.entries()]
      .map(([label, total]) => ({ label, total }))
      .reverse();
  });

readonly repartitionParStatut = computed(() => {
  const all = this._demandes();
  const statuts: ClientDemandeStatut[] = [
    'pret',
    'en_cours',
    'a_preparer',
    'correction_demandee',
    'validee',
    'rejetee',
  ];
  return statuts.map((statut) => ({
    statut,
    total: all.filter((d) => d.statut === statut).length,
  }));
});

  constructor() {
    this.charger();
  }

  charger(): void {
    this._loading.set(true);
    this._erreur.set(null);

    this.http
      .get<ApiDemande[]>(this.baseUrl)
      .pipe(
        tap((demandesApi) => {
          this._demandes.set(demandesApi.map(mapperDemandeApiVersClient));
          this._loading.set(false);
        }),
        catchError(() => {
          this._erreur.set('Impossible de récupérer vos demandes pour le moment.');
          this._loading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  setRecherche(texte: string): void {
    this._recherche.set(texte);
  }

  setFiltre(filtre: ClientDemandeFiltre): void {
    this._filtre.set(filtre);
  }

  /** Lecture synchrone depuis le cache déjà chargé (liste "Mes demandes"). */
  getById(id: string): ClientDemande | undefined {
    return this._demandes().find((d) => d.id === id);
  }

  /**
   * Récupère une demande par id, avec fallback réseau si elle n'est pas encore
   * en cache (ex: arrivée directe sur /espace/demandes/:id, rechargement de page).
   * Utilise GET /citoyen/demandes/{demande}.
   */
  getDemande(id: string) {
    const enCache = this.getById(id);
    if (enCache) {
      return of(enCache);
    }

    return this.http.get<ApiDemande>(`${this.baseUrl}/${id}`).pipe(
      map(mapperDemandeApiVersClient),
      tap((demande) => this._demandes.update((liste) => [...liste, demande]))
    );
  }

  prochainePrete(): ClientDemande | undefined {
    return this.demandes().find((d) => d.statut === 'pret');
  }

  confirmerRetrait(id: string): void {
    // TODO(API) : aucun endpoint de confirmation de retrait côté citoyen dans le
    // contrat actuel — seul /agent/demandes/{id}/remettre existe, côté agent.
    // À clarifier avec le backend : le retrait est-il uniquement déclenché par
    // la mairie, ou faut-il un endpoint citoyen dédié ?
    console.warn('confirmerRetrait : endpoint backend manquant, action non exécutée.');
  }
}