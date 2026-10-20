import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AgentAuthService } from '../../../../Services/agent-auth.service';
import { DossierTransfere } from '../../shared/models/demande.model';
import { mapperVersDossierTransfere } from '../../../../core/utils/transfert.mapper';
import { AgentDemandeApiDto, AgentDemandeService } from '../../../../Services/agentDemande.service';

@Component({
  selector: 'app-transferts-list',
  standalone: true,
  imports: [Icon, StatCard, StatusBadge],
  templateUrl: './transferts-list.html',
  styleUrl: './transferts-list.css',
})
export class TransfertsList implements OnInit {
  private demandeService = inject(AgentDemandeService);
  private authService = inject(AgentAuthService);
  private router = inject(Router);

  private readonly _toutes = signal<AgentDemandeApiDto[]>([]);
  loading = signal(false);
  erreur = signal<string | null>(null);

  private mesTransferts = computed(() => {
    const mairieId = this.authService.profile()?.mairie_id;
    if (!mairieId) return [];

    return this._toutes().filter(
      (d) => d.mairie_retrait_id === mairieId && d.mairie_origine_id !== mairieId
    );
  });

  dossiers = computed<DossierTransfere[]>(() =>
    this.mesTransferts().map(mapperVersDossierTransfere)
  );

  total = computed(() => this.mesTransferts().length);

  // ⚠️ Regroupement provisoire — voir la question ci-dessous sur les 4 stats.
  stats = computed(() => {
    const all = this.mesTransferts();
    return [
      { label: 'Nouveaux dossiers', value: String(all.filter((d) => d.statut === 'nouvelle').length), icon: 'inbox', iconBg: 'green-dark', footer: '', footerTone: 'neutral' as const },
      { label: 'À préparer', value: String(all.filter((d) => d.statut === 'en_cours').length), icon: 'briefcase', iconBg: 'yellow', footer: 'Action requise', footerTone: 'warn' as const },
      { label: 'Prêts pour retrait', value: String(all.filter((d) => d.statut === 'validee' && !d.date_remise).length), icon: 'check-circle', iconBg: 'green', footer: 'Citoyens notifiés', footerTone: 'neutral' as const },
      { label: 'Retraits effectués', value: String(all.filter((d) => !!d.date_remise).length), icon: 'archive', iconBg: 'gray', footer: '', footerTone: 'neutral' as const },
    ];
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.demandeService.getDemandes().subscribe({
      next: (demandes) => {
        this._toutes.set(demandes);
        this.loading.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de récupérer les dossiers transférés.');
        this.loading.set(false);
      },
    });
  }

  ouvrir(id: number) {
  this.router.navigate(['/transferts', id]);
}
}