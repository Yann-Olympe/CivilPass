import { ClientUserProfile } from '../models/client-user.model';

// Donnée de test — simule le citoyen actuellement connecté.
export const CLIENT_USER_MOCK: ClientUserProfile = {
  prenom: 'Emmanuel',
  nom: 'Fézo',
  email: 'emmanuel.fezo@example.cm',
  telephone: '+237 6 90 12 34 56',
  adresse: 'Quartier Bastos, Rue 1.850',
  ville: 'Yaoundé',
  dateNaissance: '1994-03-18',
};
