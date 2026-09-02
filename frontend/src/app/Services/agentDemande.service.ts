import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AgentDemandeApiDto {
  id: number;
  type_demande: string;
  statut: string;
  numero_acte: string;
  annee_acte: number;
  qr_token: string;
  usager_id: number;
  mairie_origine_id: number;
  mairie_retrait_id: number;
  date_creation: string;
  usager: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    [key: string]: any;
  };
  filiation?: {
    pere_nom: string;
    mere_nom: string;
  };
  mairie_origine?: { id: number; nom: string; ville: string };
  mairie_retrait?: { id: number; nom: string; ville: string };
  transfert?: any;
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