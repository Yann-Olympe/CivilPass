import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Mairie } from '../shared/models/demande-acte.model';
import { environment } from '../../environments/environment';
import { httpResource } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class MairieService {
  // MOCK — à remplacer par un vrai appel HttpClient une fois GET /api/mairies confirmé
   private mairiesResource = httpResource<Mairie[]>(() => ({
    url: `${environment.apiUrl}/api/mairies`,
    method: 'GET'
  }));

  mairies = this.mairiesResource.value;
  isLoading = this.mairiesResource.isLoading;
  error = this.mairiesResource.error;

  /* MOCK temporaire — à activer si le backend /api/mairies n'est pas encore prêt.
     Commente le bloc httpResource ci-dessus et décommente ceci pour continuer à avancer :

  private mock: Mairie[] = [
    { id: 1, nom: 'Mairie de Douala 1er' },
    { id: 2, nom: 'Mairie de Douala 2e' },
    { id: 3, nom: 'Mairie de Douala 3e' },
    { id: 4, nom: 'Mairie de Yaoundé I' },
    { id: 5, nom: 'Mairie de Yaoundé II' }
  ];
  mairies = signal(this.mock);
  isLoading = signal(false);
  error = signal(null);
  */
  }
