import { ClientUserProfile } from '../../features/Dashbord client/shared/models/client-user.model';
import { Usager } from '../models/usager.model';

export function mapperUsagerVersProfil(usager: Usager): ClientUserProfile {
  return {
    prenom: usager.prenom,
    nom: usager.nom,
    email: usager.email,
    telephone: usager.telephone,
    adresse: usager.adresse,
    ville: usager.ville,
    dateNaissance: usager.date_naissance,
  };
}

export interface UpdateProfilPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  date_naissance?: string;
}

export function mapperProfilVersPayload(
  modifications: Partial<ClientUserProfile>
): UpdateProfilPayload {
  const payload: UpdateProfilPayload = {};
  if (modifications.nom !== undefined) payload.nom = modifications.nom;
  if (modifications.prenom !== undefined) payload.prenom = modifications.prenom;
  if (modifications.email !== undefined) payload.email = modifications.email;
  if (modifications.telephone !== undefined) payload.telephone = modifications.telephone;
  if (modifications.adresse !== undefined) payload.adresse = modifications.adresse;
  if (modifications.ville !== undefined) payload.ville = modifications.ville;
  if (modifications.dateNaissance !== undefined) payload.date_naissance = modifications.dateNaissance;
  return payload;
}