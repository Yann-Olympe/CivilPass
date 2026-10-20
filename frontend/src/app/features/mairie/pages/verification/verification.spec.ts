import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { AgentAuthService } from '../../../../Services/agent-auth.service';
import { DemandesStore } from '../../shared/data/demandes.store';
import { ToastService } from '../../shared/components/toast/toast.service';
import { Demande } from '../../shared/models/demande.model';
import { Verification } from './verification';

describe('Verification mairie actions', () => {
  function createComponent(agentMairieId: number, demande: Demande) {
    const store = {
      demandes: signal([demande]),
      getById: vi.fn(() => demande),
      prochaineAVerifier: vi.fn(),
      valider: vi.fn(() => of({ ...demande, statut: 'en_cours' })),
      recevoir: vi.fn(() => of({ ...demande, statut: 'validee' })),
      remettre: vi.fn(() => of({ ...demande, statut: 'remise' })),
      rejeter: vi.fn(() => of({ ...demande, statut: 'rejetee' })),
      demanderCorrection: vi.fn(() => of({ ...demande, statut: 'correction_demandee' })),
    };

    TestBed.configureTestingModule({
      imports: [Verification],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => demande.id } } },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: DemandesStore, useValue: store },
        { provide: ToastService, useValue: { show: vi.fn() } },
        {
          provide: AgentAuthService,
          useValue: { profile: signal({ mairie_id: agentMairieId }) },
        },
      ],
    });

    return TestBed.createComponent(Verification).componentInstance;
  }

  const nouvelleDemande: Demande = {
    id: '19',
    citoyen: 'Test Citoyen',
    anneeActe: 1962,
    mairieOrigine: 'Mairie de Douala',
    mairieOrigineId: 1,
    mairieRetrait: 'Mairie de Yaoundé I',
    mairieRetraitId: 2,
    date: '2026-10-20',
    soumisLe: 0,
    statut: 'nouvelle',
  };

  it('allows review actions for the origin mairie while the request is new', () => {
    const component = createComponent(1, nouvelleDemande);

    expect(component.isMairieOrigine()).toBe(true);
    expect(component.peutVerifierDemande()).toBe(true);
  });

  it('hides origin review actions from the withdrawal mairie while waiting for origin validation', () => {
    const component = createComponent(2, nouvelleDemande);

    expect(component.isMairieRetrait()).toBe(true);
    expect(component.isMairieOrigine()).toBe(false);
    expect(component.peutVerifierDemande()).toBe(false);
  });

  it('allows withdrawal reception for an urgent request only when a validated transfer exists', () => {
    const urgentTransfer: Demande = {
      ...nouvelleDemande,
      statut: 'urgente',
      transfertId: '87',
      transfertStatut: 'valide',
    };
    const component = createComponent(2, urgentTransfer);

    expect(component.peutReceptionner()).toBe(true);

    component.demande.set({ ...urgentTransfer, transfertStatut: undefined });
    expect(component.peutReceptionner()).toBe(false);
  });

  it('does not allow origin review actions after the request has been transferred', () => {
    const demandeTransferee: Demande = { ...nouvelleDemande, statut: 'en_cours' };
    const component = createComponent(1, demandeTransferee);

    expect(component.peutVerifierDemande()).toBe(false);
  });

  it('sends a correction request with its reason and reports success after the API responds', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      demanderCorrection: ReturnType<typeof vi.fn>;
    };
    component.motif.set('Le numéro de l’acte doit être vérifié.');

    component.confirmerCorrection();

    expect(store.demanderCorrection).toHaveBeenCalledWith(
      nouvelleDemande.id,
      'Le numéro de l’acte doit être vérifié.'
    );
    expect(component.correctionEnCours()).toBe(false);
    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      'La demande de correction a été envoyée au citoyen.',
      'success'
    );
  });

  it('reports correction API errors without showing success', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      demanderCorrection: ReturnType<typeof vi.fn>;
    };
    store.demanderCorrection.mockReturnValue(throwError(() => ({ status: 0 })));
    component.motif.set('Le numéro de l’acte doit être vérifié.');

    component.confirmerCorrection();

    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      'Connexion impossible. La demande de correction n’a pas été envoyée.',
      'danger'
    );
    expect(component.correctionEnCours()).toBe(false);
  });

  it('records a rejection reason before showing success', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      rejeter: ReturnType<typeof vi.fn>;
    };
    component.motif.set('Aucune correspondance dans le registre.');

    component.confirmerRejet();

    expect(store.rejeter).toHaveBeenCalledWith(
      nouvelleDemande.id,
      'Aucune correspondance dans le registre.'
    );
    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      `Demande ${nouvelleDemande.id} rejetée.`,
      'success'
    );
  });

  it('does not report a rejection as successful when the API fails', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      rejeter: ReturnType<typeof vi.fn>;
    };
    store.rejeter.mockReturnValue(throwError(() => ({ status: 0 })));
    component.motif.set('Aucune correspondance dans le registre.');

    component.confirmerRejet();

    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      'Connexion impossible. Le rejet n’a pas été enregistré.',
      'danger'
    );
    expect(component.rejetEnCours()).toBe(false);
  });

  it('waits for the server response before confirming and navigating after validation', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      valider: ReturnType<typeof vi.fn>;
    };
    const response = new Subject<Demande>();
    store.valider.mockReturnValue(response);

    component.valider();
    component.valider();

    expect(store.valider).toHaveBeenCalledTimes(1);
    expect(component.validationEnCours()).toBe(true);
    expect(TestBed.inject(ToastService).show).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();

    response.next({ ...nouvelleDemande, statut: 'en_cours', transfertId: '87' });
    response.complete();

    expect(component.validationEnCours()).toBe(false);
    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      `Demande ${nouvelleDemande.id} validée avec succès.`,
      'success'
    );
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith([
      '/mairie/transferts',
      '87',
    ]);
  });

  it('does not show validation success or navigate when the server fails', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      valider: ReturnType<typeof vi.fn>;
    };
    store.valider.mockReturnValue(throwError(() => ({ status: 500 })));

    component.valider();

    expect(component.validationEnCours()).toBe(false);
    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      'Le serveur n’a pas pu enregistrer l’action « validation ». Réessayez plus tard.',
      'danger'
    );
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });

  it('does not treat an observable completion without a response as confirmation', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      valider: ReturnType<typeof vi.fn>;
    };
    const response = new Subject<Demande>();
    store.valider.mockReturnValue(response);

    component.valider();
    response.complete();

    expect(component.validationEnCours()).toBe(false);
    expect(TestBed.inject(ToastService).show).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });

  it('shows validation errors without changing the demand or navigating', () => {
    const component = createComponent(1, nouvelleDemande);
    const store = TestBed.inject(DemandesStore) as unknown as {
      valider: ReturnType<typeof vi.fn>;
    };
    store.valider.mockReturnValue(throwError(() => ({ status: 422 })));

    component.valider();

    expect(component.demande()?.statut).toBe('nouvelle');
    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      'Les informations fournies ne permettent pas de terminer l’action « validation ». Vérifiez-les et réessayez.',
      'danger'
    );
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });

  it('waits for server confirmation for reception and handover actions', () => {
    const reception = { ...nouvelleDemande, statut: 'validee' as const };
    const component = createComponent(2, { ...nouvelleDemande, statut: 'en_cours' });
    const store = TestBed.inject(DemandesStore) as unknown as {
      recevoir: ReturnType<typeof vi.fn>;
      remettre: ReturnType<typeof vi.fn>;
    };
    const receptionResponse = new Subject<Demande>();
    store.recevoir.mockReturnValue(receptionResponse);

    component.recevoir();
    expect(TestBed.inject(ToastService).show).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    receptionResponse.next(reception);
    receptionResponse.complete();

    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      `Demande ${nouvelleDemande.id} réceptionnée.`,
      'success'
    );
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith([
      '/mairie/demandes',
      nouvelleDemande.id,
    ]);

    TestBed.resetTestingModule();
    const demandeValidee = { ...nouvelleDemande, statut: 'validee' as const };
    const remiseComponent = createComponent(2, demandeValidee);
    const remiseResponse = new Subject<Demande>();
    const remiseStore = TestBed.inject(DemandesStore) as unknown as {
      remettre: ReturnType<typeof vi.fn>;
    };
    remiseStore.remettre.mockReturnValue(remiseResponse);

    remiseComponent.remettre();
    expect(TestBed.inject(ToastService).show).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    remiseResponse.next({ ...demandeValidee, statut: 'remise' });
    remiseResponse.complete();

    expect(TestBed.inject(ToastService).show).toHaveBeenCalledWith(
      `Demande ${nouvelleDemande.id} remise au citoyen.`,
      'success'
    );
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith([
      '/mairie/demandes',
      nouvelleDemande.id,
    ]);
  });
});
