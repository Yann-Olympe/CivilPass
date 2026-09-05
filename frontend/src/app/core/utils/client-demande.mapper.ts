import { ApiDemande } from '../../Services/api-demande.model';
import {
  ClientDemande,
  ClientDemandeEtape,
  ClientDemandeStatut,
  ClientDemandeType,
  CLIENT_TYPE_LABEL,
} from '../../features/Dashbord client/shared/models/client-demande.model';

// Statuts réels envoyés par le backend (partagés avec le workflow agent/mairie) :
// 'nouvelle' | 'en_cours' | 'validee' | 'urgente' | 'rejetee' | 'correction_demandee'
//
// ⚠️ 'urgente' est traité comme un simple 'en_cours' faute de mieux : ce statut
// semble écraser l'info d'étape réelle (une demande urgente en vérification vs
// urgente et déjà validée ont la même valeur `statut`). À clarifier avec le
// backend — idéalement l'urgence devrait être un champ booléen séparé plutôt
// que de partager l'enum de statut.
const STATUT_API_VERS_CLIENT: Record<string, ClientDemandeStatut> = {
  nouvelle: 'a_preparer',
  en_cours: 'en_cours',
  validee: 'pret',
  urgente: 'en_cours',
  rejetee: 'rejetee',
  correction_demandee: 'correction_demandee',
};

const STATUT_PAR_DEFAUT: ClientDemandeStatut = 'a_preparer';

function resoudreStatut(statutApi: string): ClientDemandeStatut {
  const statut = STATUT_API_VERS_CLIENT[statutApi];
  if (!statut) {
    console.warn(
      `[client-demande.mapper] Statut backend inconnu : "${statutApi}". ` +
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

  return [
    {
      label: 'Demande soumise',
      description: 'Votre dossier a été enregistré.',
      date: formaterDate(api.date_creation),
      atteinte: true,
    },
    {
      label: 'Vérification',
      description:
        statutClient === 'a_preparer'
          ? (descriptionBackend ?? "Contrôle des informations par l'agent d'état civil.")
          : "Contrôle effectué par l'agent d'état civil.",
      date: statutClient !== 'a_preparer' ? dateMaj : undefined,
      atteinte: statutClient !== 'a_preparer',
    },
    {
      label: 'Prêt pour retrait',
      description:
        statutClient === 'validee'
          ? 'Document retiré au guichet.'
          : statutClient === 'pret'
            ? (descriptionBackend ?? 'Le document est disponible au guichet.')
            : 'Le document sera disponible au guichet.',
      date: statutClient === 'pret' || statutClient === 'validee' ? dateMaj : undefined,
      atteinte: statutClient === 'pret' || statutClient === 'validee',
    },
  ];
}

export function mapperDemandeApiVersClient(api: ApiDemande): ClientDemande {
  const type: ClientDemandeType = api.type_demande;
  const statutClient = resoudreStatut(api.statut);

  return {
    id: String(api.id),
    reference: `REQ-${api.id}`,
    type,
    titre: CLIENT_TYPE_LABEL[type],
    dateCreation: formaterDate(api.date_creation),
    dateCreationTs: Date.parse(api.date_creation),
    mairieRetrait: api.mairie_retrait?.nom ?? '—',
    statut: statutClient,
    motif: api.observation_origine ?? api.motif_statut ?? undefined,
    etapes: construireEtapes(api, statutClient),
  };
}