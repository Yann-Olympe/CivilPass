export type StatutDemande =
  | 'nouvelle'
  | 'en_cours'
  | 'validee'
  | 'remise'
  | 'urgente'
  | 'rejetee'
  | 'correction_demandee';

export interface ChampRegistre {
  label: string;
  declare: string;
  registre: string;
  divergence: boolean;
}

export interface DetailDemande {
  demandeur: {
    nomComplet: string;
    numeroCni: string;
    telephone: string;
    email: string;
  };
  acte: {
    type: string;
    numero: string;
    dateLieu: string;
  };
  champs: ChampRegistre[];
}

export interface Demande {
  id: string;
  transfertId?: string;
  citoyen: string;
  anneeActe: number;
  mairieOrigine?: string;
  mairieOrigineId?: number;
  mairieRetrait: string;
  mairieRetraitId?: number;
  transfertStatut?: string;
  date: string;
  soumisLe: number;
  statut: StatutDemande;
  motifRejet?: string;
  motifCorrection?: string;
  detail?: DetailDemande;
}

export interface DossierTransfere {
  id: string;
  idBrut: number;
  citoyen: string;
  avatarInitiales: string;
  mairieOrigine: string;
  dateReception: string;
  statut: StatutDemande;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  footer: string;
  footerTone: 'up' | 'warn' | 'neutral';
}
