import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AgentDemandeApiDto, AgentDemandeService } from '../../../../Services/agentDemande.service';
import { TransfertsList } from './transferts-list';

function demandeAvecTransfert(
  id: number,
  statutTransfert: 'en_attente' | 'valide' | 'recu',
  statutDemande = 'en_cours'
): AgentDemandeApiDto {
  return {
    id,
    type_demande: 'naissance',
    statut: statutDemande,
    numero_acte: `NA-${id}`,
    annee_acte: 2000,
    qr_token: `qr-${id}`,
    usager_id: id,
    mairie_origine_id: 1,
    mairie_retrait_id: 2,
    date_creation: '2026-10-01T08:00:00.000Z',
    usager: {
      id,
      nom: `Nom ${id}`,
      prenom: `Prenom ${id}`,
      telephone: '699000000',
    },
    mairie_origine: { id: 1, nom: 'Mairie origine', ville: 'Douala' },
    mairie_retrait: { id: 2, nom: 'Mairie retrait', ville: 'Yaoundé' },
    transfert: {
      id: id + 100,
      demande_id: id,
      statut: statutTransfert,
      date_validation_origine: '2026-10-02T08:00:00.000Z',
      date_reception_retrait: statutTransfert === 'recu' ? '2026-10-03T08:00:00.000Z' : null,
    },
  };
}

describe('TransfertsList', () => {
  let api: { getDemandes: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  function creerComposant() {
    return TestBed.createComponent(TransfertsList);
  }

  beforeEach(() => {
    api = { getDemandes: vi.fn(() => of([])) };
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TransfertsList],
      providers: [
        { provide: AgentDemandeService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('loads only persisted transfers and derives counters from their real statuses', () => {
    api.getDemandes.mockReturnValue(of([
      demandeAvecTransfert(1, 'valide'),
      demandeAvecTransfert(2, 'recu', 'remise'),
      { ...demandeAvecTransfert(3, 'recu'), transfert: null },
    ]));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(api.getDemandes).toHaveBeenCalledTimes(1);
    expect(component.chargement()).toBe(false);
    expect(component.dossiers()).toHaveLength(2);
    expect(component.dossiers()[0].id).toBe('101');
    expect(component.dossiers()[0].reference).toBe('REQ-1');
    expect(component.dossiers()[0].mairieOrigine).toBe('Mairie origine');
    expect(component.dossiers()[0].mairieRetrait).toBe('Mairie retrait');
    expect(component.dossiers()[0].dateReception).toBe('—');
    expect(component.stats().map((stat) => stat.value)).toEqual(['2', '1', '1', '1']);
    expect(fixture.nativeElement.textContent).not.toContain('44');
    expect(fixture.nativeElement.textContent).not.toContain('Emmanuel Etoo');
  });

  it('searches transfers and applies combined search and status filters', () => {
    api.getDemandes.mockReturnValue(of([
      demandeAvecTransfert(1, 'valide'),
      demandeAvecTransfert(2, 'recu'),
      demandeAvecTransfert(3, 'en_attente'),
    ]));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changerFiltre('recu');
    component.changerRecherche('mairie origine');
    expect(component.dossiersFiltres().map((dossier) => dossier.id)).toEqual(['102']);
    expect(api.getDemandes).toHaveBeenCalledTimes(1);

    component.changerRecherche('REQ-404');
    expect(component.dossiers()).toHaveLength(0);

    component.changerFiltre('en_attente');
    component.changerRecherche('yaounde');
    expect(component.dossiersFiltres().map((dossier) => dossier.id)).toEqual(['103']);
  });

  it('paginates filtered data and preserves criteria when moving between pages', () => {
    api.getDemandes.mockReturnValue(of(
      Array.from({ length: 12 }, (_, index) =>
        demandeAvecTransfert(index + 1, index === 11 ? 'valide' : 'recu')
      )
    ));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changerRecherche('mairie origine');
    component.changerFiltre('recu');
    expect(component.dossiers().length).toBe(10);
    expect(component.nombrePages()).toBe(2);

    component.pageSuivante();
    expect(component.pageActuelle()).toBe(2);
    expect(component.dossiers().map((dossier) => dossier.id)).toEqual(['111']);
    expect(component.recherche()).toBe('mairie origine');
    expect(component.filtre()).toBe('recu');

    component.pageSuivante();
    expect(component.pageActuelle()).toBe(2);
    component.pagePrecedente();
    expect(component.pageActuelle()).toBe(1);
    expect(api.getDemandes).toHaveBeenCalledTimes(1);
  });

  it('resets search, status filter, and pagination', () => {
    api.getDemandes.mockReturnValue(of(
      Array.from({ length: 12 }, (_, index) => demandeAvecTransfert(index + 1, 'recu'))
    ));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.changerRecherche('mairie origine');
    component.changerFiltre('recu');
    component.pageSuivante();
    component.reinitialiserFiltres();

    expect(component.recherche()).toBe('');
    expect(component.filtre()).toBe('tous');
    expect(component.pageActuelle()).toBe(1);
    expect(component.dossiers().length).toBe(10);
  });

  it('connects the search, combined status filter, reset, and pagination controls', () => {
    api.getDemandes.mockReturnValue(of(
      Array.from({ length: 12 }, (_, index) =>
        demandeAvecTransfert(index + 1, index === 11 ? 'valide' : 'recu')
      )
    ));
    const fixture = creerComposant();
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector('.list-search input') as HTMLInputElement;
    search.value = 'REQ-12';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.dossiersFiltres()).toHaveLength(1);

    const status = fixture.nativeElement.querySelector('.list-filter select') as HTMLSelectElement;
    status.value = 'valide';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.dossiersFiltres()).toHaveLength(1);

    const reset = fixture.nativeElement.querySelector('.list-actions button') as HTMLButtonElement;
    reset.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.recherche()).toBe('');
    expect(fixture.componentInstance.filtre()).toBe('tous');
    expect(fixture.componentInstance.pageActuelle()).toBe(1);

    const nextPage = fixture.nativeElement.querySelector(
      '[aria-label="Page suivante"]'
    ) as HTMLButtonElement;
    nextPage.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.pageActuelle()).toBe(2);
  });

  it('shows an error and no fabricated transfer data when the API fails', () => {
    api.getDemandes.mockReturnValue(throwError(() => ({ status: 500 })));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.chargement()).toBe(false);
    expect(component.erreur()).toContain('Impossible de charger les transferts');
    expect(component.dossiers()).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('app-stat-card')).toHaveLength(0);
    expect(fixture.nativeElement.textContent).not.toContain('Emmanuel Etoo');
  });

  it('shows the empty state when the API returns no transfers', () => {
    api.getDemandes.mockReturnValue(of([]));
    const fixture = creerComposant();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun transfert ne correspond');
    expect(fixture.nativeElement.querySelectorAll('app-stat-card')).toHaveLength(4);
  });

  it('opens the real demand route for a transfer row', () => {
    api.getDemandes.mockReturnValue(of([demandeAvecTransfert(19, 'recu')]));
    const fixture = creerComposant();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.ouvrir(component.dossiers()[0].id);

    expect(router.navigate).toHaveBeenCalledWith(['/mairie/transferts', '119']);
  });
});
