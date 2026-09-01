import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AgentDemandeApiDto {
  id: string;
  citoyen?: string;
  usager?: { nom: string; prenom: string };
  annee_acte: number;
  mairie_retrait?: string;
  date_soumission: string;
  statut: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AgentDemandeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/agent`;

  getDemandes(): Observable<AgentDemandeApiDto[]> {
    return this.http.get<AgentDemandeApiDto[]>(`${this.baseUrl}/demandes`);
  }

  valider(id: string): Observable<AgentDemandeApiDto> {
    return this.http.post<AgentDemandeApiDto>(`${this.baseUrl}/demandes/${id}/valider`, {});
  }

  recevoir(id: string): Observable<AgentDemandeApiDto> {
    return this.http.post<AgentDemandeApiDto>(`${this.baseUrl}/demandes/${id}/recevoir`, {});
  }

  remettre(id: string): Observable<AgentDemandeApiDto> {
    return this.http.post<AgentDemandeApiDto>(`${this.baseUrl}/demandes/${id}/remettre`, {});
  }
}