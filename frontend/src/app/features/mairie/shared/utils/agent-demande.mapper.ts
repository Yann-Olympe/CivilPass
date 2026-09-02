import { Demande, StatutDemande } from '../models/demande.model';
import { AgentDemandeApiDto } from '../../../../Services/agentDemande.service';

export function mapAgentDemandeDto(dto: AgentDemandeApiDto): Demande {
  return {
    id: String(dto.id),
    citoyen: `${dto.usager.prenom} ${dto.usager.nom}`.trim(),
    anneeActe: dto.annee_acte,
    mairieRetrait: dto.mairie_retrait?.nom ?? '',
    date: dto.date_creation,
    soumisLe: Date.parse(dto.date_creation),
    statut: dto.statut as StatutDemande,
  };
}