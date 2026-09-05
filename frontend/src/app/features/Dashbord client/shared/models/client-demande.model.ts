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
  mairieRetrait: string;
  statut: ClientDemandeStatut;
  motif?: string;
  etapes: ClientDemandeEtape[];
}

export const CLIENT_STATUT_LABELS: Record<ClientDemandeStatut, string> = {
  en_cours: 'En cours',
  a_preparer: 'À préparer',
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