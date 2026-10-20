import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AgentDemandeApiDto, AgentDemandeService } from '../../../../Services/agentDemande.service';
import { TransfertDetail } from './transfert-detail';

const demandeTransferee: AgentDemandeApiDto = {
  id: 29,
  type_demande: 'naissance',
  statut: 'en_cours',
  numero_acte: 'NA-29',
  annee_acte: 2001,
  qr_token: 'server-qr',
  usager_id: 1,
  mairie_origine_id: 1,
  mairie_retrait_id: 2,
  date_creation: '2026-10-14T08:00:00.000Z',
  usager: { id: 1, nom: 'Nom réel', prenom: 'Prénom réel', telephone: '699000000' },
  mairie_origine: { id: 1, nom: 'Mairie origine réelle', ville: 'Douala' },
  mairie_retrait: { id: 2, nom: 'Mairie retrait réelle', ville: 'Yaoundé' },
  transfert: {
    id: 87,
    demande_id: 29,
    statut: 'valide',
    date_validation_origine: '2026-10-15T09:30:00.000Z',
    date_reception_retrait: null,
  },
};

describe('TransfertDetail', () => {
  let service: { getTransfert: ReturnType<typeof vi.fn> };

  function creerComposant(id = '87') {
    TestBed.configureTestingModule({
      imports: [TransfertDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id })) },
        },
        { provide: AgentDemandeService, useValue: service },
      ],
    });

    return TestBed.createComponent(TransfertDetail);
  }

  beforeEach(() => {
    service = { getTransfert: vi.fn(() => of(demandeTransferee)) };
  });

  it('loads and displays only the transfer data returned for the route demand id', () => {
    const fixture = creerComposant();
    fixture.detectChanges();

    expect(service.getTransfert).toHaveBeenCalledWith('87');
    expect(fixture.componentInstance.demande()?.transfert?.id).toBe(87);
    expect(fixture.nativeElement.textContent).toContain('Transfert #87');
    expect(fixture.nativeElement.textContent).toContain('demande #29');
    expect(fixture.nativeElement.textContent).toContain('Mairie origine réelle');
    expect(fixture.nativeElement.textContent).toContain('Mairie retrait réelle');
    expect(fixture.nativeElement.textContent).toContain('Validé à l’origine — réception en attente');
    expect(fixture.nativeElement.textContent).not.toContain('Signature cryptographique');
  });

  it('keeps reception and citizen delivery as distinct statuses', () => {
    const fixture = creerComposant();
    fixture.componentInstance.demande.set({
      ...demandeTransferee,
      statut: 'validee',
      transfert: {
        ...demandeTransferee.transfert!,
        statut: 'recu',
        date_reception_retrait: '2026-10-16T09:30:00.000Z',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Réceptionné');
    expect(fixture.nativeElement.textContent).toContain('Réceptionnée par la mairie de retrait');
    expect(fixture.nativeElement.textContent).not.toContain('Remise au citoyen');
  });

  it('shows a not-found message when the demand has no persisted transfer', () => {
    service.getTransfert.mockReturnValue(of({ ...demandeTransferee, transfert: null }));
    const fixture = creerComposant();
    fixture.detectChanges();

    expect(fixture.componentInstance.erreur()).toContain('Aucun transfert enregistré');
    expect(fixture.nativeElement.textContent).not.toContain('Transfert #87');
  });

  it('shows an authorization error returned by the API', () => {
    service.getTransfert.mockReturnValue(throwError(() => ({ status: 403 })));
    const fixture = creerComposant();
    fixture.detectChanges();

    expect(fixture.componentInstance.erreur()).toContain('pas autorisé');
    expect(fixture.nativeElement.textContent).not.toContain('Mairie origine réelle');
  });

  it('shows a not-found error returned by the API', () => {
    service.getTransfert.mockReturnValue(throwError(() => ({ status: 404 })));
    const fixture = creerComposant();
    fixture.detectChanges();

    expect(fixture.componentInstance.erreur()).toContain('introuvable');
  });
});
