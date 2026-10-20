import { Demande, DetailDemande, ChampRegistre, StatutDemande } from '../../features/mairie/shared/models/demande.model';
import { AgentDemandeApiDto } from '../../Services/agentDemande.service';


function formaterDateHeure(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} à ${heure}`;
}

function construireDetail(dto: AgentDemandeApiDto): DetailDemande {
  const champs: ChampRegistre[] = [
    {
      label: 'Nom',
      declare: dto.usager.nom,
      // ⚠️ Pas de vraie donnée de registre physique disponible (aucune mairie
      // n'a encore de registre numérisé à interroger) — la colonne "Registre"
      // recopie la déclaration en attendant. Voir la note plus bas sur le
      // panneau de vérification.
      registre: dto.usager.nom,
      divergence: false,
    },
    {
      label: 'Prénoms',
      declare: dto.usager.prenom,
      registre: dto.usager.prenom,
      divergence: false,
    },
    {
      label: 'Année de naissance',
      declare: String(dto.annee_acte),
      registre: String(dto.annee_acte),
      divergence: false,
    },
  ];

  if (dto.filiation?.pere_nom) {
    champs.push({
      label: 'Nom du Père',
      declare: dto.filiation.pere_nom,
      registre: dto.filiation.pere_nom,
      divergence: false,
    });
  }

  if (dto.filiation?.mere_nom) {
    champs.push({
      label: 'Nom de la Mère',
      declare: dto.filiation.mere_nom,
      registre: dto.filiation.mere_nom,
      divergence: false,
    });
  }

  return {
    demandeur: {
      nomComplet: `${dto.usager.prenom} ${dto.usager.nom}`.trim(),
      numeroCni: dto.usager.cni_numero ?? '—', // vérifie le nom exact du champ dans usager (voir note ci-dessous)
      telephone: dto.usager.telephone ?? '—',
      email: dto.usager.email ?? '—',
    },
    acte: {
      type: "Copie Intégrale d'Acte de Naissance",
      numero: dto.numero_acte,
      dateLieu: `Année ${dto.annee_acte}, ${dto.mairie_origine?.nom ?? '—'}`,
    },
    champs,
  };
}

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