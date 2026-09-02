export interface AgentLoginPayload {
  email: string;
  password: string;
}

export interface AgentProfile {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  mairie_id: number;
  mairie_nom?: string;
}

export interface AgentAuthResponse {
  token: string;
  agent: AgentProfile;
}