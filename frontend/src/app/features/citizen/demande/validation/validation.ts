import { Component } from '@angular/core';

interface LigneInfo {
  label: string;
  valeur: string;
}

interface BlocValidation {
  icone: 'demandeur' | 'acte' | 'mairie-origine' | 'mairie-retrait';
  titre: string;
  lignes: LigneInfo[];
}

@Component({
  selector: 'app-validation',
  imports: [],
  templateUrl: './validation.html',
  styleUrl: './validation.css',
})
export class Validation {
   etapes = [
    { numero: 1, label: 'Identité', etat: 'termine' as const },
    { numero: 2, label: 'Acte', etat: 'termine' as const },
    { numero: 3, label: 'Mairies', etat: 'termine' as const },
    { numero: 4, label: 'Validation', etat: 'actuelle' as const },
  ];

  blocs: BlocValidation[] = [
    {
      icone: 'demandeur',
      titre: 'Demandeur',
      lignes: [
        { label: 'Nom complet', valeur: 'Jean Dupont' },
        { label: 'CNI', valeur: '123456789' },
        { label: 'Téléphone', valeur: '+237 600 000 000' },
      ],
    },
    {
      icone: 'acte',
      titre: "Informations de l'acte",
      lignes: [
        { label: "Type d'acte", valeur: 'Acte de Naissance' },
        { label: "Numéro d'acte", valeur: 'AN-2023-890' },
        { label: 'Année de registre', valeur: '1990' },
      ],
    },
    {
      icone: 'mairie-origine',
      titre: "Mairie d'origine",
      lignes: [
        { label: 'Région', valeur: 'Centre' },
        { label: 'Département', valeur: 'Mfoundi' },
        { label: 'Commune', valeur: 'Yaoundé I' },
      ],
    },
    {
      icone: 'mairie-retrait',
      titre: 'Mairie de retrait',
      lignes: [
        { label: 'Lieu de retrait', valeur: 'Yaoundé I' },
        { label: 'Frais', valeur: '1 000 FCFA' },
      ],
    },
  ];

  modifier(bloc: BlocValidation): void {
    // TODO: naviguer vers l'étape correspondante du formulaire
    console.log('Modifier', bloc.titre);
  }

  envoyerDemande(): void {
    // TODO: appeler le service de création de demande
  }
}
