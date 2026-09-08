export interface ClientNotification {
  id: number;
  demande_id: number;
  type: string;
  message: string;
  lue: boolean;
  created_at: string;
  demande?: {
    id: number;
    statut: string;
    type_demande: string;
  } | null;
}
