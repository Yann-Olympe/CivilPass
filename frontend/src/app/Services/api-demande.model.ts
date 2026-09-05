export interface ApiMairie {
  id: number;
  nom: string;
  ville: string;
}

export interface ApiFiliation {
  id: number;
  demande_id: number;
  pere_nom: string | null;
  mere_nom: string | null;
}

export interface ApiTransfert {
  id: number;
  demande_id: number;
  statut: string;
  date_validation_origine: string | null;
  date_reception_retrait: string | null;
}

export interface ApiDemande {
  id: number;
  type_demande: 'naissance';
  // Le backend a fait évoluer cet enum au-delà du contrat initial documenté
  // (ex: "nouvelle" observé en prod). On le type en string plutôt que d'y
  // figer une liste qui se désynchronisera à nouveau — voir le mapper pour
  // la table de correspondance et son fallback.
  statut: string;
  numero_acte: string | null;
  annee_acte: number | null;
  qr_token: string;
  souche_retrouvee?: boolean | null;
  observation_origine: string | null;
  motif_statut?: string | null;
  date_remise?: string | null;
  usager_id: number;
  mairie_origine_id: number;
  mairie_retrait_id: number;
  date_creation: string;
  created_at: string;
  updated_at: string;
  mairie_origine?: ApiMairie;
  mairie_retrait?: ApiMairie;
  filiation?: ApiFiliation;
  transfert?: ApiTransfert | null;
}