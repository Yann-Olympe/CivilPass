import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AgentDemandeApiDto, AgentDemandeService } from '../../../../Services/agentDemande.service';
import { StatCard as StatCardModel } from '../../shared/models/demande.model';

type FiltreTransfert = 'tous' | 'en_attente' | 'valide' | 'recu';
const DOSSIERS_PAR_PAGE = 10;

function normaliserRecherche(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR');
}

interface DossierTransfere {
  id: string;
  reference: string;
  citoyen: string;
  avatarInitiales: string;
  mairieOrigine: string;
  villeOrigine: string;
  mairieRetrait: string;
  villeRetrait: string;
  dateValidation: string;
  dateReception: string;
  statut: string;
  demandeStatut: string;
}

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [Icon, StatCard, StatusBadge],
  templateUrl: './transferts-list.html',
  styleUrl: './transferts-list.css',
})
export class TransfertsList implements OnInit {
  private router = inject(Router);
  private agentDemandeService = inject(AgentDemandeService);

  private readonly _dossiers = signal<DossierTransfere[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly recherche = signal('');
  readonly filtre = signal<FiltreTransfert>('tous');
  readonly pageActuelle = signal(1);

  readonly dossiersFiltres = computed(() => {
    const terme = normaliserRecherche(this.recherche().trim());
    const filtre = this.filtre();

    return this._dossiers().filter((dossier) => {
      const correspondRecherche = !terme || [
        dossier.id,
        dossier.reference,
        dossier.citoyen,
        dossier.mairieOrigine,
        dossier.villeOrigine,
        dossier.mairieRetrait,
        dossier.villeRetrait,
      ].some((valeur) => normaliserRecherche(valeur).includes(terme));
      const correspondFiltre = filtre === 'tous' || dossier.statut === filtre;
      return correspondRecherche && correspondFiltre;
    });
  });

  readonly nombrePages = computed(() =>
    Math.ceil(this.dossiersFiltres().length / DOSSIERS_PAR_PAGE)
  );

  readonly dossiers = computed(() => {
    const debut = (this.pageActuelle() - 1) * DOSSIERS_PAR_PAGE;
    return this.dossiersFiltres().slice(debut, debut + DOSSIERS_PAR_PAGE);
  });

  readonly debutAffichage = computed(() =>
    this.dossiersFiltres().length === 0
      ? 0
      : (this.pageActuelle() - 1) * DOSSIERS_PAR_PAGE + 1
  );

  readonly finAffichage = computed(() =>
    Math.min(this.pageActuelle() * DOSSIERS_PAR_PAGE, this.dossiersFiltres().length)
  );

  readonly stats = computed<StatCardModel[]>(() => {
    const dossiers = this._dossiers();
    const enAttenteReception = dossiers.filter((dossier) => dossier.statut === 'valide').length;
    const receptionnes = dossiers.filter((dossier) => dossier.statut === 'recu').length;
    const remis = dossiers.filter((dossier) => dossier.demandeStatut === 'remise').length;

    return [
      {
        label: 'Transferts enregistrés',
        value: String(dossiers.length),
        icon: 'transfer',
        iconBg: 'green-dark',
        footer: 'Avec un transfert présent en base',
        footerTone: 'neutral',
      },
      {
        label: 'En attente de réception',
        value: String(enAttenteReception),
        icon: 'inbox',
        iconBg: 'yellow',
        footer: 'Validés par la mairie d’origine',
        footerTone: enAttenteReception > 0 ? 'warn' : 'neutral',
      },
      {
        label: 'Réceptionnés',
        value: String(receptionnes),
        icon: 'check-circle',
        iconBg: 'green',
        footer: 'Confirmés par la mairie de retrait',
        footerTone: 'neutral',
      },
      {
        label: 'Documents remis',
        value: String(remis),
        icon: 'archive',
        iconBg: 'gray',
        footer: 'Statut de demande : remise',
        footerTone: 'neutral',
      },
    ];
  });

  ngOnInit(): void {
    this.chargerTransferts();
  }

  chargerTransferts(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.agentDemandeService.getDemandes().subscribe({
      next: (demandes) => {
        this._dossiers.set(
          demandes
            .filter((demande) => demande.transfert != null)
            .sort((a, b) => {
              const dateA = Date.parse(a.transfert?.date_validation_origine ?? '') || 0;
              const dateB = Date.parse(b.transfert?.date_validation_origine ?? '') || 0;
              return dateB - dateA;
            })
            .map((demande) => this.mapperDossier(demande))
        );
        if (this.nombrePages() === 0) {
          this.pageActuelle.set(1);
        } else if (this.pageActuelle() > this.nombrePages()) {
          this.pageActuelle.set(this.nombrePages());
        }
        this.chargement.set(false);
      },
      error: (error) => {
        console.error('[TransfertsList] Impossible de charger les transferts.', error);
        this._dossiers.set([]);
        this.erreur.set('Impossible de charger les transferts. Réessayez dans quelques instants.');
        this.chargement.set(false);
      },
    });
  }

  changerRecherche(valeur: string): void {
    this.recherche.set(valeur);
    this.pageActuelle.set(1);
  }

  changerFiltre(valeur: string): void {
    if (valeur !== 'tous' && valeur !== 'en_attente' && valeur !== 'valide' && valeur !== 'recu') {
      return;
    }
    this.filtre.set(valeur);
    this.pageActuelle.set(1);
  }

  reinitialiserFiltres(): void {
    this.recherche.set('');
    this.filtre.set('tous');
    this.pageActuelle.set(1);
  }

  pagePrecedente(): void {
    if (this.pageActuelle() > 1) {
      this.pageActuelle.update((page) => page - 1);
    }
  }

  pageSuivante(): void {
    if (this.pageActuelle() < this.nombrePages()) {
      this.pageActuelle.update((page) => page + 1);
    }
  }

  private mapperDossier(demande: AgentDemandeApiDto): DossierTransfere {
    const prenom = demande.usager?.prenom ?? '';
    const nom = demande.usager?.nom ?? '';
    const citoyen = `${prenom} ${nom}`.trim() || 'Citoyen non renseigné';
    const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toLocaleUpperCase() || '—';
    const transfert = demande.transfert!;

    return {
      id: String(transfert.id),
      reference: `REQ-${demande.id}`,
      citoyen,
      avatarInitiales: initiales,
      mairieOrigine: demande.mairie_origine?.nom ?? '—',
      villeOrigine: demande.mairie_origine?.ville ?? '',
      mairieRetrait: demande.mairie_retrait?.nom ?? '—',
      villeRetrait: demande.mairie_retrait?.ville ?? '',
      dateValidation: this.formaterDate(transfert.date_validation_origine),
      dateReception: this.formaterDate(transfert.date_reception_retrait),
      statut: transfert.statut,
      demandeStatut: demande.statut,
    };
  }

  private formaterDate(date: string | null): string {
    if (!date) return '—';
    const horodatage = Date.parse(date);
    if (Number.isNaN(horodatage)) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(horodatage);
  }

  ouvrir(id: string): void {
    this.router.navigate(['/mairie/transferts', id]);
  }
}