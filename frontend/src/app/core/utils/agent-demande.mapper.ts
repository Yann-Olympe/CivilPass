import { Demande, StatutDemande } from '../../features/mairie/shared/models/demande.model';
import { AgentDemandeApiDto } from '../../Services/agentDemande.service';

export function mapAgentDemandeDto(dto: AgentDemandeApiDto): Demande {
  return {
    id: String(dto.id),
    transfertId: dto.transfert ? String(dto.transfert.id) : undefined,
    transfertStatut: dto.transfert?.statut,
    citoyen: `${dto.usager.prenom} ${dto.usager.nom}`.trim(),
    anneeActe: dto.annee_acte,
    mairieOrigine: dto.mairie_origine?.nom,
    mairieOrigineId: dto.mairie_origine_id,
    mairieRetrait: dto.mairie_retrait?.nom ?? '',
    mairieRetraitId: dto.mairie_retrait_id,
    date: dto.date_creation,
    soumisLe: Date.parse(dto.date_creation),
    statut: dto.statut as StatutDemande,
    motifRejet: dto.statut === 'rejetee' ? dto.motif_statut ?? undefined : undefined,
    motifCorrection: dto.statut === 'correction_demandee' ? dto.motif_statut ?? undefined : undefined,
  };
}