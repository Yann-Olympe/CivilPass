import { Injectable, computed, signal } from '@angular/core';
import { ClientDemande, ClientDemandeStatut } from '../models/client-demande.model';
import { CLIENT_DEMANDES_MOCK } from '../data/demandes-client.mock';

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

/**
 * Simule un service backend pour les demandes de l'espace citoyen.
 * TODO(API) : remplacer les données/temps de latence simulés par de vrais appels
 * HttpClient vers /api/citoyen/demandes une fois l'API disponible (cf. DemandeService).
 */
@Injectable({ providedIn: 'root' })
export class ClientDemandesService {
  private readonly _demandes = signal<ClientDemande[]>(CLIENT_DEMANDES_MOCK);
  private readonly _loading = signal(false);
  private readonly _recherche = signal('');
  private readonly _filtre = signal<ClientDemandeFiltre>('all');

  readonly loading = this._loading.asReadonly();
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

  /** Liste affichée dans "Mes demandes" : recherche texte + filtre de statut combinés. */
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

  /** Répartition des demandes par mois, utilisée par la page Statistiques. */
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
    const statuts: ClientDemandeStatut[] = ['pret', 'en_cours', 'a_preparer', 'validee', 'rejetee'];
    return statuts.map((statut) => ({
      statut,
      total: all.filter((d) => d.statut === statut).length,
    }));
  });

  constructor() {
    // Simule un premier chargement réseau au démarrage du module.
    this._loading.set(true);
    setTimeout(() => this._loading.set(false), 350);
  }

  setRecherche(texte: string): void {
    this._recherche.set(texte);
  }

  setFiltre(filtre: ClientDemandeFiltre): void {
    this._filtre.set(filtre);
  }

  getById(id: string): ClientDemande | undefined {
    return this._demandes().find((d) => d.id === id);
  }

  /** La prochaine demande prête pour retrait (utilisée pour la bannière du tableau de bord). */
  prochainePrete(): ClientDemande | undefined {
    return this.demandes().find((d) => d.statut === 'pret');
  }

  /** Simule la confirmation de retrait d'un acte au guichet. */
  confirmerRetrait(id: string): void {
    this._demandes.update((list) =>
      list.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          statut: 'validee',
          etapes: d.etapes.map((e, i, arr) =>
            i === arr.length - 1
              ? { ...e, label: 'Retirée', description: 'Document retiré au guichet.', atteinte: true }
              : e
          ),
        };
      })
    );
  }
}
