export type ClientDemandeType = 'naissance' | 'mariage' | 'deces';

export type ClientDemandeStatut =
  | 'en_cours'
  | 'a_preparer'
  | 'pret'
  | 'validee'
  | 'rejetee'
  | 'correction_demandee';

export interface ClientDemandeEtape {
  label: string;
  description: string;
  date?: string;
  atteinte: boolean;
}

export interface ClientDemande {
  id: string;
  reference: string;
  type: ClientDemandeType;
  titre: string;
  dateCreation: string;
  dateCreationTs: number;
  mairieOrigine?: string;
  mairieRetrait: string;
  statut: ClientDemandeStatut;
  motif?: string;
  numeroActe?: string;
  anneeActe?: number;
  pereNom?: string;
  mereNom?: string;
  etapes: ClientDemandeEtape[];
}

export const CLIENT_STATUT_LABELS: Record<ClientDemandeStatut, string> = {
  en_cours: 'Validation mairie de retrait en attente',
  a_preparer: 'Validation mairie d’origine en attente',
  pret: 'Prêt pour retrait',
  validee: 'Retirée',
  rejetee: 'Rejetée',
  correction_demandee: 'Correction requise',
};

export const CLIENT_TYPE_ICON: Record<ClientDemandeType, string> = {
  naissance: 'file-text',
  mariage: 'heart',
  deces: 'id-badge',
};

export const CLIENT_TYPE_LABEL: Record<ClientDemandeType, string> = {
  naissance: 'Acte de naissance',
  mariage: 'Acte de mariage',
  deces: 'Certificat de décès',
};