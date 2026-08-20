import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DemandeActePayload,DemandeActeResponse } from '../shared/models/demande-acte.model';

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/demandes`;

  creerDemande(payload: DemandeActePayload): Observable<DemandeActeResponse> {
    return this.http.post<DemandeActeResponse>(this.baseUrl, payload);
  }

  getDemandeByToken(qrToken: string): Observable<DemandeActeResponse> {
    return this.http.get<DemandeActeResponse>(`${this.baseUrl}/suivi/${qrToken}`);
  }
}