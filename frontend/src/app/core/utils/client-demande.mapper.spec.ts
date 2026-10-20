import { ApiDemande } from '../../Services/api-demande.model';
import { mapperDemandeApiVersClient } from './client-demande.mapper';

function demandeAvecStatut(statut: string): ApiDemande {
  return {
    id: 12,
    type_demande: 'naissance',
    statut,
    numero_acte: 'NA-12',
    annee_acte: 2020,
    qr_token: 'qr-token',
    observation_origine: null,
    motif_statut: null,
    date_remise: null,
    usager_id: 5,
    mairie_origine_id: 1,
    mairie_retrait_id: 2,
    date_creation: '2026-10-01T08:00:00.000Z',
    created_at: '2026-10-01T08:00:00.000Z',
    updated_at: '2026-10-02T08:00:00.000Z',
    mairie_origine: { id: 1, nom: 'Mairie de Douala 1er', ville: 'Douala' },
    mairie_retrait: { id: 2, nom: 'Mairie de Yaoundé 2e', ville: 'Yaoundé' },
  };
}

describe('mapperDemandeApiVersClient validation steps', () => {
  it('shows that the origin mairie has not validated a newly submitted request', () => {
    const demande = mapperDemandeApiVersClient(demandeAvecStatut('nouvelle'));

    expect(demande.statut).toBe('a_preparer');
    expect(demande.mairieOrigine).toBe('Mairie de Douala 1er');
    expect(demande.etapes[1]).toMatchObject({
      label: 'Validation par la mairie d’origine',
      description: 'Votre demande attend encore la validation de Mairie de Douala 1er.',
      atteinte: false,
    });
  });

  it('shows origin approval and pending validation by the requested withdrawal mairie', () => {
    const apiDemande = demandeAvecStatut('en_cours');
    apiDemande.transfert = {
      id: 7,
      demande_id: apiDemande.id,
      statut: 'valide',
      date_validation_origine: '2026-10-03T08:00:00.000Z',
      date_reception_retrait: null,
    };
    const demande = mapperDemandeApiVersClient(apiDemande);

    expect(demande.statut).toBe('en_cours');
    expect(demande.etapes[1]).toMatchObject({
      label: 'Validation par la mairie d’origine',
      description: 'Mairie de Douala 1er a validé votre demande.',
      atteinte: true,
    });
    expect(demande.etapes[2]).toMatchObject({
      label: 'Validation par la mairie de retrait',
      description: 'Mairie de Yaoundé 2e doit encore réceptionner et valider votre dossier.',
      atteinte: false,
    });
  });

  it('does not claim origin approval for an urgent request without a validated transfer', () => {
    const demande = mapperDemandeApiVersClient(demandeAvecStatut('urgente'));

    expect(demande.statut).toBe('a_preparer');
    expect(demande.etapes[1].description).toBe(
      'Votre demande attend encore la validation de Mairie de Douala 1er.'
    );
  });

  it('keeps an urgent request at the withdrawal mairie stage after origin approval', () => {
    const apiDemande = demandeAvecStatut('urgente');
    apiDemande.transfert = {
      id: 7,
      demande_id: apiDemande.id,
      statut: 'valide',
      date_validation_origine: '2026-10-03T08:00:00.000Z',
      date_reception_retrait: null,
    };
    const demande = mapperDemandeApiVersClient(apiDemande);

    expect(demande.statut).toBe('en_cours');
    expect(demande.etapes[2].description).toBe(
      'Mairie de Yaoundé 2e doit encore réceptionner et valider votre dossier.'
    );
  });
});
