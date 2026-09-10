export interface AgentLoginPayload {
  email: string;
  password: string;
}

export interface AgentMairie {
  id: number;
  nom: string;
  ville: string;
}

export interface AgentProfile {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  mairie_id: number;
  mairie?: AgentMairie;
}

export interface AgentAuthResponse {
  token: string;
  agent: AgentProfile;
}