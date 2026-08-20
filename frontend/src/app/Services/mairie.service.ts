import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Mairie } from '../shared/models/demande-acte.model';


@Injectable({ providedIn: 'root' })
export class MairieService {
  // MOCK — à remplacer par un vrai appel HttpClient une fois GET /api/mairies confirmé
  getMairies(): Observable<Mairie[]> {
    const mock: Mairie[] = [
      { id: 1, nom: 'Mairie de Douala 1er' },
      { id: 2, nom: 'Mairie de Douala 2e' },
      { id: 3, nom: 'Mairie de Douala 3e' },
      { id: 4, nom: 'Mairie de Yaoundé I' },
      { id: 5, nom: 'Mairie de Yaoundé II' }
    ];
    return of(mock).pipe(delay(300));
  }

  /* Version réelle, à activer quand l'endpoint est prêt :
  private http = inject(HttpClient);

  getMairies(): Observable<Mairie[]> {
    return this.http.get<Mairie[]>(`${environment.apiUrl}/mairies`);
  }
  */
}