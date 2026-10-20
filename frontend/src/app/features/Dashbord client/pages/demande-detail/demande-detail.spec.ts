import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { DemandeDetail } from './demande-detail';
import { ClientDemandesService } from '../../shared/services/client-demandes.service';
import { ClientToastService } from '../../shared/services/client-toast.service';
import { ClientDemande } from '../../shared/models/client-demande.model';

const demande: ClientDemande = {
  id: '42',
  reference: 'REQ-42',
  type: 'naissance',
  titre: 'Acte de naissance',
  dateCreation: '01 janv. 2026',
  dateCreationTs: 1767225600000,
  mairieRetrait: 'Mairie de Douala',
  statut: 'pret',
  etapes: [],
};

describe('DemandeDetail withdrawal confirmation', () => {
  let service: {
    getDemande: ReturnType<typeof vi.fn>;
    confirmerRetrait: ReturnType<typeof vi.fn>;
    soumettreCorrection: ReturnType<typeof vi.fn>;
  };
  let toast: { show: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = {
      getDemande: vi.fn(() => of(demande)),
      confirmerRetrait: vi.fn(),
      soumettreCorrection: vi.fn(),
    };
    toast = { show: vi.fn() };

    TestBed.configureTestingModule({
      imports: [DemandeDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: demande.id })) },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ClientDemandesService, useValue: service },
        { provide: ClientToastService, useValue: toast },
      ],
    });
  });

  it('shows success only after the API confirms the withdrawal and ignores duplicate clicks', () => {
    const response = new Subject<ClientDemande>();
    service.confirmerRetrait.mockReturnValue(response);
    const fixture = TestBed.createComponent(DemandeDetail);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.confirmerRetrait();
    component.confirmerRetrait();

    expect(service.confirmerRetrait).toHaveBeenCalledTimes(1);
    expect(component.confirmationRetraitEnCours()).toBe(true);
    expect(toast.show).not.toHaveBeenCalled();

    const demandeRetiree = { ...demande, statut: 'validee' as const };
    response.next(demandeRetiree);
    response.complete();

    expect(component.demande()).toEqual(demandeRetiree);
    expect(component.confirmRetraitOpen()).toBe(false);
    expect(component.confirmationRetraitEnCours()).toBe(false);
    expect(toast.show).toHaveBeenCalledWith('Retrait confirmé avec succès.', 'success');
  });

  it('shows an error and never reports success when the API request fails', () => {
    service.confirmerRetrait.mockReturnValue(throwError(() => ({ status: 0 })));
    const fixture = TestBed.createComponent(DemandeDetail);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.confirmRetraitOpen.set(true);

    component.confirmerRetrait();

    expect(toast.show).toHaveBeenCalledWith(
      'Connexion impossible. Le retrait n’a pas pu être confirmé.',
      'danger'
    );
    expect(toast.show).not.toHaveBeenCalledWith('Retrait confirmé avec succès.', 'success');
    expect(component.confirmRetraitOpen()).toBe(true);
    expect(component.confirmationRetraitEnCours()).toBe(false);
  });

  it('resubmits a correction once and shows success only after the API response', () => {
    const correctionDemandee: ClientDemande = {
      ...demande,
      statut: 'correction_demandee',
      numeroActe: 'NA-42',
      anneeActe: 2020,
      pereNom: 'Père',
      mereNom: 'Mère',
      motif: 'Vérifiez le numéro de l’acte.',
    };
    service.getDemande.mockReturnValue(of(correctionDemandee));
    const response = new Subject<ClientDemande>();
    service.soumettreCorrection.mockReturnValue(response);
    const fixture = TestBed.createComponent(DemandeDetail);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.modifierCorrection('numeroActe', 'NA-42-CORRIGE');
    component.resoumettreCorrection();
    component.resoumettreCorrection();

    expect(service.soumettreCorrection).toHaveBeenCalledTimes(1);
    expect(service.soumettreCorrection).toHaveBeenCalledWith('42', {
      numero_acte: 'NA-42-CORRIGE',
      annee_acte: 2020,
      filiation: { pere_nom: 'Père', mere_nom: 'Mère' },
    });
    expect(component.correctionEnCours()).toBe(true);
    expect(toast.show).not.toHaveBeenCalled();

    const resoumise = { ...correctionDemandee, statut: 'a_preparer' as const };
    response.next(resoumise);
    response.complete();

    expect(component.demande()).toEqual(resoumise);
    expect(component.correctionEnCours()).toBe(false);
    expect(toast.show).toHaveBeenCalledWith(
      'Vos corrections ont été envoyées à la mairie d’origine.',
      'success'
    );
  });

  it('does not report success when the correction resubmission fails', () => {
    const correctionDemandee: ClientDemande = {
      ...demande,
      statut: 'correction_demandee',
      numeroActe: 'NA-42',
      anneeActe: 2020,
    };
    service.getDemande.mockReturnValue(of(correctionDemandee));
    service.soumettreCorrection.mockReturnValue(throwError(() => ({ status: 0 })));
    const fixture = TestBed.createComponent(DemandeDetail);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.resoumettreCorrection();

    expect(toast.show).toHaveBeenCalledWith(
      'Connexion impossible. Vos corrections n’ont pas été envoyées.',
      'danger'
    );
    expect(toast.show).not.toHaveBeenCalledWith(
      'Vos corrections ont été envoyées à la mairie d’origine.',
      'success'
    );
    expect(component.correctionEnCours()).toBe(false);
  });
});
