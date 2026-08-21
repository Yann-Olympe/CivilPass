export interface IdentiteData {
  nom: string;
  prenom: string;
  telephone: string;
  cni?: string; // non envoyé au backend pour l'instant — pas dans le contrat README
}

export interface ActeData {
  numeroActe: string;
  anneeEnregistrement: number;
  nom: string;      // titulaire de l'acte — TODO backend : pas de champ prévu côté API
  prenoms?: string; // idem
  nomPere?: string;
  nomMere?: string;
}

export interface MairiesData {
  mairieOrigineId: number;
  mairieRetraitId: number;
}

export interface DemandeActeState {
  identite?: IdentiteData;
  acte?: ActeData;
  mairies?: MairiesData;
}

// Payload exact attendu par POST /api/demandes (contrat README backend)
export interface DemandeActePayload {
  usager: {
    nom: string;
    prenom: string;
    telephone: string;
  };
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
  numero_demande: string;
  statut: string;
  qr_token?: string;
}

export interface Mairie {
  id: number;
  nom: string;
}