import { ApiDemande } from '../../Services/api-demande.model';
import {
  ClientDemande,
  ClientDemandeEtape,
  ClientDemandeStatut,
  ClientDemandeType,
  CLIENT_TYPE_LABEL,
} from '../../features/Dashbord client/shared/models/client-demande.model';

// 'urgente' est appliqué par la mairie d'origine avant ou après sa validation.
// La date de validation du transfert permet de distinguer ces deux étapes.
const STATUT_API_VERS_CLIENT: Record<string, ClientDemandeStatut> = {
  nouvelle: 'a_preparer',
  en_cours: 'en_cours',
  validee: 'pret',
  remise: 'validee',
  rejetee: 'rejetee',
  correction_demandee: 'correction_demandee',
};

const STATUT_PAR_DEFAUT: ClientDemandeStatut = 'a_preparer';

function resoudreStatut(api: ApiDemande): ClientDemandeStatut {
  if (api.statut === 'urgente') {
    return api.transfert?.date_validation_origine ? 'en_cours' : 'a_preparer';
  }

  const statut = STATUT_API_VERS_CLIENT[api.statut];
  if (!statut) {
    console.warn(
      `[client-demande.mapper] Statut backend inconnu : "${api.statut}". ` +
        `Ajoute-le à STATUT_API_VERS_CLIENT (valeur par défaut "${STATUT_PAR_DEFAUT}" utilisée pour l'instant).`
    );
    return STATUT_PAR_DEFAUT;
  }
  return statut;
}

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function construireEtapes(api: ApiDemande, statutClient: ClientDemandeStatut): ClientDemandeEtape[] {
  const dateMaj = formaterDate(api.updated_at);
  const descriptionBackend = api.motif_statut ?? undefined;
  const mairieOrigine = api.mairie_origine?.nom ?? 'la mairie d’origine';
  const mairieRetrait = api.mairie_retrait?.nom ?? 'la mairie de retrait';

  if (statutClient === 'a_preparer') {
    return [
      {
        label: 'Demande soumise',
        description: 'Votre dossier a été enregistré.',
        date: formaterDate(api.date_creation),
        atteinte: true,
      },
      {
        label: 'Validation par la mairie d’origine',
        description: `Votre demande attend encore la validation de ${mairieOrigine}.`,
        atteinte: false,
      },
      {
        label: 'Validation par la mairie de retrait',
        description: 'Cette étape commencera après la validation de la mairie d’origine.',
        atteinte: false,
      },
    ];
  }

  if (statutClient === 'correction_demandee') {
    return [
      {
        label: 'Demande soumise',
        description: 'Votre dossier a été enregistré.',
        date: formaterDate(api.date_creation),
        atteinte: true,
      },
      {
        label: 'Correction requise',
        description: descriptionBackend ?? 'Merci de corriger les informations demandées.',
        date: dateMaj,
        atteinte: false,
      },
      {
        label: 'Prêt pour retrait',
        description: 'Le document sera disponible au guichet une fois le dossier corrigé.',
        atteinte: false,
      },
    ];
  }

  if (statutClient === 'rejetee') {
    return [
      {
        label: 'Demande soumise',
        description: 'Votre dossier a été enregistré.',
        date: formaterDate(api.date_creation),
        atteinte: true,
      },
      {
        label: 'Vérification',
        description: "Contrôle effectué par l'agent d'état civil.",
        date: dateMaj,
        atteinte: true,
      },
      {
        label: 'Rejetée',
        description: descriptionBackend ?? "Le dossier n'a pas pu être validé.",
        date: dateMaj,
        atteinte: true,
      },
    ];
  }

  if (statutClient === 'en_cours') {
    return [
      {
        label: 'Demande soumise',
        description: 'Votre dossier a été enregistré.',
        date: formaterDate(api.date_creation),
        atteinte: true,
      },
      {
        label: 'Validation par la mairie d’origine',
        description: `${mairieOrigine} a validé votre demande.`,
        date: formaterDate(api.transfert?.date_validation_origine ?? api.updated_at),
        atteinte: true,
      },
      {
        label: 'Validation par la mairie de retrait',
        description: `${mairieRetrait} doit encore réceptionner et valider votre dossier.`,
        atteinte: false,
      },
    ];
  }

  const retraitConfirme = statutClient === 'validee';

  return [
    {
      label: 'Demande soumise',
      description: 'Votre dossier a été enregistré.',
      date: formaterDate(api.date_creation),
      atteinte: true,
    },
    {
      label: 'Vérification',
      description: "Contrôle effectué par l'agent d'état civil.",
      date: formaterDate(api.transfert?.date_validation_origine ?? api.updated_at),
      atteinte: true,
    },
    {
      label: retraitConfirme ? 'Retrait confirmé' : 'Prêt pour retrait',
      description:
        retraitConfirme
          ? 'Document retiré au guichet.'
          : statutClient === 'pret'
            ? (descriptionBackend ?? 'Le document est disponible au guichet.')
            : 'Le document sera disponible au guichet.',
      date: retraitConfirme
        ? formaterDate(api.date_remise ?? api.updated_at)
        : statutClient === 'pret'
          ? formaterDate(api.transfert?.date_reception_retrait ?? api.updated_at)
          : undefined,
      atteinte: statutClient === 'pret' || retraitConfirme,
    },
  ];
}

export function mapperDemandeApiVersClient(api: ApiDemande): ClientDemande {
  const type: ClientDemandeType = api.type_demande;
  const statutClient = resoudreStatut(api);

  return {
    id: String(api.id),
    reference: `REQ-${api.id}`,
    type,
    titre: CLIENT_TYPE_LABEL[type],
    dateCreation: formaterDate(api.date_creation),
    dateCreationTs: Date.parse(api.date_creation),
    mairieOrigine: api.mairie_origine?.nom,
    mairieRetrait: api.mairie_retrait?.nom ?? '—',
    statut: statutClient,
    motif: api.observation_origine ?? api.motif_statut ?? undefined,
    numeroActe: api.numero_acte ?? undefined,
    anneeActe: api.annee_acte ?? undefined,
    pereNom: api.filiation?.pere_nom ?? undefined,
    mereNom: api.filiation?.mere_nom ?? undefined,
    etapes: construireEtapes(api, statutClient),
  };
}