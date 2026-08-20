import { Component } from '@angular/core';
  type EtatEtape = 'termine' | 'en_cours' | 'a_venir';

interface EtapeHistorique {
  titre: string;
  date?: string;
  description?: string;
  descriptionEncadree?: boolean;
  etat: EtatEtape;
}

@Component({
  selector: 'app-suivi',
  imports: [],
  templateUrl: './suivi.html',
  styleUrl: './suivi.css',
})
export class Suivi {


  reference = 'REQ-847291';
  typeActe = 'Acte de Naissance - Copie Intégrale';
  statut = 'En cours de traitement';

  infos = [
    { label: "Mairie d'origine", valeur: 'Yaoundé I' },
    { label: 'Mairie de retrait', valeur: 'Douala I' },
    { label: 'Date de dépôt', valeur: '12 Octobre 2024' },
    { label: 'Demandeur', valeur: 'Jean-Paul Kamga' },
  ];

  historique: EtapeHistorique[] = [
    {
      titre: 'Demande envoyée',
      date: '12 Oct 2024, 09:15',
      etat: 'termine',
    },
    {
      titre: 'Demande reçue par la Mairie d\'origine',
      date: '12 Oct 2024, 14:30',
      description: 'Votre demande a été réceptionnée par les services de l\'état civil.',
      descriptionEncadree: true,
      etat: 'termine',
    },
    {
      titre: "Vérification de l'acte",
      description: "L'officier d'état civil procède à la vérification dans les registres physiques de l'année concernée.",
      etat: 'en_cours',
    },
    { titre: 'Demande validée', etat: 'a_venir' },
    { titre: 'Transfert vers la Mairie de retrait', etat: 'a_venir' },
    { titre: 'Acte préparé', etat: 'a_venir' },
  ];

  retourDossiers(): void {
    // TODO: naviguer vers la liste des dossiers du citoyen
  }
}
