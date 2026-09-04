// Profil citoyen affiché / modifiable dans "Mon profil".
export interface ClientUserProfile {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  dateNaissance: string; // format yyyy-MM-dd (utilisé tel quel dans un <input type="date">)
}

export function initialesOf(profile: Pick<ClientUserProfile, 'prenom' | 'nom'>): string {
  const p = profile.prenom?.trim()?.[0] ?? '';
  const n = profile.nom?.trim()?.[0] ?? '';
  return (p + n).toUpperCase() || '??';
}
