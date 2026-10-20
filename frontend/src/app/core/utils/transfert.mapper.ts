import { DossierTransfere, StatutDemande } from "../../features/mairie/shared/models/demande.model";
import { AgentDemandeApiDto } from "../../Services/agentDemande.service";

function initiales(prenom: string, nom: string): string {
  return `${prenom?.trim()?.[0] ?? ''}${nom?.trim()?.[0] ?? ''}`.toUpperCase() || '??';
}

function formaterDateHeure(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapperVersDossierTransfere(api: AgentDemandeApiDto): DossierTransfere {
  const annee = new Date(api.date_creation).getFullYear();

  return {
    id: `REQ-${annee}-${String(api.id).padStart(4, '0')}`,
    idBrut: api.id,
    citoyen: `${api.usager.prenom} ${api.usager.nom}`,
    avatarInitiales: initiales(api.usager.prenom, api.usager.nom),
    mairieOrigine: api.mairie_origine?.nom ?? '—',
    dateReception: formaterDateHeure(api.updated_at ?? api.date_creation),
    statut: api.statut as StatutDemande,
  };
}
