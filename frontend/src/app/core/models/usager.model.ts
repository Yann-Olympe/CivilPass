export interface Usager {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: 'M' | 'F';
  nationalite: string;
  adresse: string;
  ville: string;
  region: string;
  nui?: string;
  cni_numero?: string;
  cni_recto_path?: string;
  cni_verso_path?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InscriptionPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: 'M' | 'F';
  nationalite: string;
  adresse: string;
  ville: string;
  region: string;
}

export interface AuthResponse {
  message?: string;
  usager: Usager;
  token: string;
}