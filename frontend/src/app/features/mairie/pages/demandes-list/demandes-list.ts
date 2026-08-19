import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { DemandesStore } from '../../shared/data/demandes.store';
import { StatutDemande } from '../../shared/models/demande.model';

type FiltreStatut = StatutDemande | 'all';

const TITRES: Record<FiltreStatut, { titre: string; sousTitre: string }> = {
  all: { titre: 'Toutes les demandes', sousTitre: "Vue d'ensemble de toutes les demandes reçues par votre Mairie." },
  nouvelle: { titre: 'Nouvelles demandes', sousTitre: 'Demandes en attente d’ouverture de vérification.' },
  en_cours: { titre: 'Demandes en cours', sousTitre: 'Demandes actuellement en cours de vérification.' },
  urgente: { titre: 'Demandes urgentes', sousTitre: 'Demandes signalées comme prioritaires.' },
  validee: { titre: 'Demandes validées', sousTitre: 'Demandes vérifiées et validées.' },
  rejetee: { titre: 'Demandes rejetées', sousTitre: 'Demandes refusées après vérification.' },
  correction_demandee: { titre: 'Corrections demandées', sousTitre: 'Demandes en attente de correction par le citoyen.' },
};

const FILTRES_DISPONIBLES: { value: FiltreStatut; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'nouvelle', label: 'Nouvelles' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'urgente', label: 'Urgentes' },
  { value: 'correction_demandee', label: 'Correction demandée' },
  { value: 'validee', label: 'Validées' },
  { value: 'rejetee', label: 'Rejetées' },
];

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [Icon, StatusBadge],
  templateUrl: './demandes-list.html',
  styleUrl: './demandes-list.css',
})
export class DemandesList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(DemandesStore);

  /** Statut imposé par la route (ex: /validees) ; 'all' pour /demandes. */
  private statutRoute: FiltreStatut = (this.route.snapshot.data['statut'] as FiltreStatut) ?? 'all';

  filtreActif = signal<FiltreStatut>(this.statutRoute);
  recherche = signal('');

  readonly filtresDisponibles = this.statutRoute === 'all' ? FILTRES_DISPONIBLES : [];

  readonly titre = TITRES[this.statutRoute].titre;
  readonly sousTitre = TITRES[this.statutRoute].sousTitre;

  readonly demandes = computed(() => {
    const filtre = this.filtreActif();
    const q = this.recherche().trim().toLowerCase();

    return this.store
      .recentes()
      .filter((d) => filtre === 'all' || d.statut === filtre)
      .filter((d) =>
        !q ||
        d.citoyen.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.mairieRetrait.toLowerCase().includes(q)
      );
  });

  choisirFiltre(f: FiltreStatut) {
    this.filtreActif.set(f);
  }

  ouvrir(id: string) {
    this.router.navigate(['/demandes', id]);
  }

  estFinalisee(statut: StatutDemande) {
    return statut === 'validee' || statut === 'rejetee';
  }
}
