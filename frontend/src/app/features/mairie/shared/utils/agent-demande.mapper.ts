import { Demande, StatutDemande } from '../models/demande.model';
import { AgentDemandeApiDto } from '../../../../Services/agentDemande.service';

// ⚠️ À ajuster précisément une fois la vraie réponse backend vue
export function mapAgentDemandeDto(dto: AgentDemandeApiDto): Demande {
  return {
    id: dto.id,
    citoyen: dto.citoyen ?? `${dto.usager?.prenom ?? ''} ${dto.usager?.nom ?? ''}`.trim(),
    anneeActe: dto.annee_acte,
    mairieRetrait: dto.mairie_retrait ?? '',
    date: dto.date_soumission,
    soumisLe: Date.parse(dto.date_soumission),
    statut: dto.statut as StatutDemande,
  };
}