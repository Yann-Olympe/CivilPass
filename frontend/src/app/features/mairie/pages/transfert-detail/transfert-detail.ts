import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { AgentDemandeApiDto, AgentDemandeService } from '../../../../Services/agentDemande.service';
import { Icon } from '../../shared/icon/icon';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

type DetailState =
  | { kind: 'loaded'; demande: AgentDemandeApiDto }
  | { kind: 'error'; message: string };

@Component({
  selector: 'app-transfert-detail',
  standalone: true,
  imports: [Icon, RouterLink, StatusBadge],
  templateUrl: './transfert-detail.html',
  styleUrl: './transfert-detail.css'
})
export class TransfertDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly agentDemandeService = inject(AgentDemandeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly demande = signal<AgentDemandeApiDto | null>(null);
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      distinctUntilChanged(),
      tap(() => {
        this.chargement.set(true);
        this.erreur.set(null);
        this.demande.set(null);
      }),
      switchMap((id) => {
        if (!id || !/^\d+$/.test(id)) {
          return of<DetailState>({
            kind: 'error',
            message: 'Identifiant de transfert invalide.',
          });
        }

        return this.agentDemandeService.getTransfert(id).pipe(
          map((demande): DetailState => {
            if (!demande.transfert) {
              return { kind: 'error', message: 'Aucun transfert enregistré pour cette demande.' };
            }
            if (String(demande.transfert.id) !== id) {
              return { kind: 'error', message: 'Le serveur a retourné un transfert différent de celui demandé.' };
            }
            return { kind: 'loaded', demande };
          }),
          catchError((error: { status?: number }) => of<DetailState>({
            kind: 'error',
            message: this.messageErreur(error),
          }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((state) => {
      this.chargement.set(false);
      if (state.kind === 'loaded') {
        this.demande.set(state.demande);
      } else {
        this.erreur.set(state.message);
      }
    });
  }

  formaterDate(date: string | null | undefined): string {
    if (!date) return '—';
    const horodatage = Date.parse(date);
    if (Number.isNaN(horodatage)) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(horodatage);
  }

  private messageErreur(error: { status?: number }): string {
    if (error.status === 403) {
      return 'Vous n’êtes pas autorisé à consulter ce transfert.';
    }
    if (error.status === 404) {
      return 'La demande ou son transfert est introuvable.';
    }
    return 'Impossible de charger ce transfert. Réessayez dans quelques instants.';
  }
}
