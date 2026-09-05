export interface ActeData {
  numeroActe: string;
  anneeEnregistrement: number;
  nomPere?: string;
  nomMere?: string;
}

export interface MairiesData {
  mairieOrigineId: number;
  mairieRetraitId: number;
}

export interface DemandeActeState {
  acte?: ActeData;
  mairies?: MairiesData;
}

export interface DemandeActePayload {
  mairie_origine_id: number;
  mairie_retrait_id: number;
  numero_acte: string;
  annee_acte: number;
  filiation: {
    pere_nom: string;
    mere_nom: string;
  };
}

export interface DemandeActeResponse {
  id: number;
  qr_token: string;
  statut: string;
  [key: string]: any;
}

export interface Mairie {
  id: number;
  nom: string;
  ville?: string;
}