<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Demande;
use App\Models\Mairie;
use App\Models\Notification;
use App\Models\Transfert;
use App\Models\Usager;
use Database\Seeders\CivilPassSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private Usager $usager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CivilPassSeeder::class);
        $this->usager = Usager::create([
            'nom' => 'Test',
            'prenom' => 'User',
            'telephone' => '699000099',
            'email' => 'test@example.com',
            'lieu_naissance' => 'Douala',
            'sexe' => 'M',
            'adresse' => 'Rue 1',
            'ville' => 'Douala',
            'region' => 'Littoral',
            'nui' => 'NUI-TEST-001',
            'cni_numero' => 'CNI-TEST-001',
            'cni_recto_path' => 'tests/recto.jpg',
            'cni_verso_path' => 'tests/verso.jpg',
            'password' => 'password123',
        ]);
        Sanctum::actingAs($this->usager);
    }

    public function test_mairies_returns_seeded_mairies(): void
    {
        $response = $this->getJson('/api/mairies');

        $response->assertOk()
            ->assertJsonCount(3)
            ->assertJsonFragment(['ville' => 'Douala'])
            ->assertJsonFragment(['ville' => 'Yaoundé'])
            ->assertJsonFragment([
                'nom' => 'Mairie de Maroua Ier',
                'ville' => 'Maroua',
            ]);
    }

    public function test_maroua_seeder_assigns_existing_agent_as_both_roles_idempotently(): void
    {
        $mairieActuelle = Mairie::where('nom', 'Mairie de Douala 3e')->firstOrFail();
        $agent = Agent::create([
            'nom' => 'Agent Maroua',
            'email' => 'maroua1@gmail.com',
            'password' => 'test-password',
            'mairie_id' => $mairieActuelle->id,
            'role' => 'origine',
        ]);

        $this->seed(\Database\Seeders\MarouaMairieSeeder::class);
        $this->seed(\Database\Seeders\MarouaMairieSeeder::class);

        $mairieMaroua = Mairie::where('nom', 'Mairie de Maroua Ier')->firstOrFail();
        $agent->refresh();

        $this->assertSame($mairieMaroua->id, $agent->mairie_id);
        $this->assertSame('les_deux', $agent->role);
        $this->assertSame(1, Mairie::where('nom', 'Mairie de Maroua Ier')->count());
    }

    public function test_checklist_returns_pieces_for_naissance(): void
    {
        $response = $this->getJson('/api/checklist/naissance');

        $response->assertOk()
            ->assertJsonPath('type_demande', 'naissance')
            ->assertJsonStructure(['pieces_requises']);
    }

    public function test_checklist_returns_404_for_unknown_type(): void
    {
        $this->getJson('/api/checklist/mariage')->assertNotFound();
    }

    public function test_store_creates_demande_with_qr_token(): void
    {
        $response = $this->postJson('/api/demandes', [
            'usager' => ['nom' => 'Dupont', 'prenom' => 'Jean', 'telephone' => '699000001'],
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'numero_acte' => 'NA-2024-001',
            'annee_acte' => 2024,
            'filiation' => ['pere_nom' => 'Dupont Pierre', 'mere_nom' => 'Martin Marie'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('statut', 'nouvelle')
            ->assertJsonStructure(['qr_token', 'usager', 'filiation', 'mairie_origine', 'mairie_retrait']);

        $this->assertDatabaseHas('notifications', [
            'usager_id' => $this->usager->id,
            'demande_id' => $response->json('id'),
            'type' => 'statut_demande',
        ]);
    }

    public function test_demande_created_by_citizen_is_received_by_origin_mairie(): void
    {
        $response = $this->postJson('/api/demandes', [
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'numero_acte' => 'NA-2026-001',
            'annee_acte' => 2026,
        ]);

        $response->assertCreated();
        $demandeId = $response->json('id');

        Sanctum::actingAs(Agent::where('email', 'origine@civilpass.cm')->first());

        $this->getJson('/api/agent/demandes')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $demandeId,
                'statut' => 'nouvelle',
                'mairie_origine_id' => 1,
                'mairie_retrait_id' => 2,
            ]);

        $this->postJson("/api/agent/demandes/{$demandeId}/valider", [
            'souche_retrouvee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('demande.statut', 'en_cours');

        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->first());

        $this->getJson('/api/agent/demandes')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $demandeId,
                'statut' => 'en_cours',
            ]);
    }

    public function test_show_demande_by_qr_token(): void
    {
        $demande = $this->createDemande();

        $this->getJson("/api/demandes/{$demande->qr_token}")
            ->assertOk()
            ->assertJsonPath('id', $demande->id)
            ->assertJsonPath('checklist.type_demande', 'naissance')
            ->assertJsonCount(5, 'checklist.pieces_requises');
    }

    public function test_pdf_download_returns_pdf(): void
    {
        $demande = $this->createDemande();

        $response = $this->get("/api/demandes/{$demande->qr_token}/pdf");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_citoyen_can_download_own_receipt_pdf(): void
    {
        $demande = $this->createDemande();

        $response = $this->get("/api/citoyen/demandes/{$demande->id}/pdf");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_citoyen_cannot_download_another_citizens_receipt(): void
    {
        $demande = $this->createDemande();
        $autreUsager = Usager::create([
            'nom' => 'Autre',
            'prenom' => 'Citoyen',
            'telephone' => '699000098',
            'email' => 'autre@example.com',
            'lieu_naissance' => 'Douala',
            'sexe' => 'M',
            'adresse' => 'Rue 2',
            'ville' => 'Douala',
            'region' => 'Littoral',
            'password' => 'password123',
        ]);
        Sanctum::actingAs($autreUsager);

        $this->get("/api/citoyen/demandes/{$demande->id}/pdf")
            ->assertNotFound();
    }

    public function test_agent_login_returns_token(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'origine@civilpass.cm',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['agent', 'token']);
    }

    public function test_agent_login_rejects_invalid_credentials(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'origine@civilpass.cm',
            'password' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_agent_me_requires_authentication(): void
    {
        $this->getJson('/api/agent/me')->assertUnauthorized();
    }

    public function test_full_agent_workflow(): void
    {
        $demande = $this->createDemande();

        Sanctum::actingAs(Agent::where('email', 'origine@civilpass.cm')->first());
        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('demande.statut', 'en_cours');

        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->first());
        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")
            ->assertOk()
            ->assertJsonPath('statut', 'validee');

        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")
            ->assertOk()
            ->assertJsonPath('statut', 'remise')
            ->assertJsonPath('date_remise', fn ($date) => $date !== null);

        $this->assertDatabaseHas('notifications', [
            'usager_id' => $this->usager->id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
        ]);

        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")
            ->assertStatus(409);
    }

    public function test_urgent_priority_does_not_block_reception_and_delivery_is_separate(): void
    {
        $demande = $this->createDemande();
        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->firstOrFail());

        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")
            ->assertStatus(409);

        Sanctum::actingAs(Agent::where('email', 'origine@civilpass.cm')->firstOrFail());
        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'en_cours')
            ->assertJsonPath('transfert.statut', 'valide');

        $this->postJson("/api/agent/demandes/{$demande->id}/urgente", [
            'motif' => 'Traitement prioritaire demandé.',
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'urgente');

        $this->assertDatabaseHas('transferts', [
            'demande_id' => $demande->id,
            'statut' => 'valide',
        ]);

        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->firstOrFail());
        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")
            ->assertOk()
            ->assertJsonPath('statut', 'validee')
            ->assertJsonPath('transfert.statut', 'recu')
            ->assertJsonPath('transfert.date_reception_retrait', fn ($date) => $date !== null)
            ->assertJsonPath('transfert.date_validation_origine', fn ($date) => $date !== null)
            ->assertJsonPath('transfert.recu_par_agent_id', Agent::where('email', 'retrait@civilpass.cm')->value('id'))
            ->assertJsonPath('date_remise', null);

        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")
            ->assertStatus(409);
        $this->assertSame(
            1,
            Notification::where('demande_id', $demande->id)
                ->where('type', 'dossier_recu')
                ->count()
        );

        $this->assertDatabaseHas('demandes', [
            'id' => $demande->id,
            'statut' => 'validee',
            'date_remise' => null,
        ]);
        $this->assertDatabaseHas('transferts', [
            'demande_id' => $demande->id,
            'statut' => 'recu',
        ]);

        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")
            ->assertOk()
            ->assertJsonPath('statut', 'remise')
            ->assertJsonPath('transfert.statut', 'recu')
            ->assertJsonPath('date_remise', fn ($date) => $date !== null)
            ->assertJsonPath('remis_par_agent_id', Agent::where('email', 'retrait@civilpass.cm')->value('id'));

        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")->assertStatus(409);

        $this->assertDatabaseHas('transferts', [
            'demande_id' => $demande->id,
            'valide_par_agent_id' => Agent::where('email', 'origine@civilpass.cm')->value('id'),
            'recu_par_agent_id' => Agent::where('email', 'retrait@civilpass.cm')->value('id'),
        ]);
        $this->assertDatabaseHas('demandes', [
            'id' => $demande->id,
            'remis_par_agent_id' => Agent::where('email', 'retrait@civilpass.cm')->value('id'),
        ]);
    }

    public function test_transfer_validation_is_atomic_and_cannot_be_repeated(): void
    {
        $demande = $this->createDemande();
        $agentOrigine = Agent::where('email', 'origine@civilpass.cm')->firstOrFail();
        Sanctum::actingAs($agentOrigine);
        $notificationsStatutInitiales = Notification::where('demande_id', $demande->id)
            ->where('type', 'statut_demande')
            ->count();

        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'en_cours')
            ->assertJsonPath('transfert.statut', 'valide')
            ->assertJsonPath('transfert.valide_par_agent_id', $agentOrigine->id)
            ->assertJsonPath('transfert.date_validation_origine', fn ($date) => $date !== null);

        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])->assertStatus(409);

        $this->assertDatabaseCount('transferts', 1);
        $this->assertDatabaseHas('notifications', [
            'demande_id' => $demande->id,
            'type' => 'dossier_transfere',
        ]);
        $this->assertSame(
            1,
            Notification::where('demande_id', $demande->id)
                ->where('type', 'dossier_transfere')
                ->count()
        );
        $this->assertSame(
            $notificationsStatutInitiales + 1,
            Notification::where('demande_id', $demande->id)
                ->where('type', 'statut_demande')
                ->count()
        );
    }

    public function test_agent_with_both_roles_can_validate_maroua_origin_request_for_douala_withdrawal(): void
    {
        $mairieMaroua = Mairie::where('nom', 'Mairie de Maroua Ier')->firstOrFail();
        $mairieDouala = Mairie::where('nom', 'Mairie de Douala 3e')->firstOrFail();
        $agentMaroua = Agent::create([
            'nom' => 'Agent Maroua',
            'email' => 'maroua-validation@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $mairieMaroua->id,
            'role' => 'les_deux',
        ]);
        $response = $this->postJson('/api/demandes', [
            'mairie_origine_id' => $mairieMaroua->id,
            'mairie_retrait_id' => $mairieDouala->id,
            'filiation' => ['pere_nom' => 'A', 'mere_nom' => 'B'],
        ])->assertCreated();
        $demandeId = $response->json('id');

        Sanctum::actingAs($agentMaroua);

        $this->postJson("/api/agent/demandes/{$demandeId}/valider", [
            'souche_retrouvee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('mairie_origine_id', $mairieMaroua->id)
            ->assertJsonPath('mairie_retrait_id', $mairieDouala->id)
            ->assertJsonPath('transfert.statut', 'valide');
    }

    public function test_agent_role_must_match_mairie_action_even_within_the_same_mairie(): void
    {
        $demande = $this->createDemande();
        $agentOrigineNonHabilite = Agent::create([
            'nom' => 'Agent retrait côté origine',
            'email' => 'role-retrait-origine@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $demande->mairie_origine_id,
            'role' => 'retrait',
        ]);
        Sanctum::actingAs($agentOrigineNonHabilite);

        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])->assertForbidden();

        $agentRetraitNonHabilite = Agent::create([
            'nom' => 'Agent origine côté retrait',
            'email' => 'role-origine-retrait@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $demande->mairie_retrait_id,
            'role' => 'origine',
        ]);
        Sanctum::actingAs($agentRetraitNonHabilite);

        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")->assertForbidden();
        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")->assertForbidden();
    }

    public function test_transfer_per_demand_uniqueness_is_enforced_by_the_database(): void
    {
        $demande = $this->createDemande();
        $transfert = [
            'demande_id' => $demande->id,
            'statut' => 'valide',
            'date_validation_origine' => now(),
        ];

        Transfert::create($transfert);

        $this->expectException(QueryException::class);
        Transfert::create($transfert);
    }

    public function test_agent_transfer_detail_returns_real_transfer_and_checks_mairie_access(): void
    {
        $demande = $this->createDemande();
        $agentOrigine = Agent::where('email', 'origine@civilpass.cm')->firstOrFail();
        Sanctum::actingAs($agentOrigine);

        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])->assertOk();

        $transfertId = $demande->transfert()->value('id');
        $this->assertNotNull($transfertId);

        $this->getJson("/api/agent/transferts/{$transfertId}")
            ->assertOk()
            ->assertJsonPath('id', $demande->id)
            ->assertJsonPath('transfert.id', $transfertId);

        $mairieTierce = Mairie::create(['nom' => 'Mairie tierce', 'ville' => 'Bafoussam']);
        $agentTierce = Agent::create([
            'nom' => 'Agent tiers',
            'email' => 'tiers@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $mairieTierce->id,
            'role' => 'les_deux',
        ]);
        Sanctum::actingAs($agentTierce);

        $this->getJson("/api/agent/transferts/{$transfertId}")->assertForbidden();
        $this->getJson('/api/agent/transferts/999999')->assertNotFound();

        Sanctum::actingAs($this->usager);
        $this->getJson('/api/agent/demandes')->assertForbidden();
        $this->getJson("/api/agent/transferts/{$transfertId}")->assertForbidden();
    }

    public function test_agent_transfer_list_excludes_transfers_outside_the_agents_mairie_scope(): void
    {
        $demande = $this->createDemande();
        Sanctum::actingAs(Agent::where('email', 'origine@civilpass.cm')->firstOrFail());
        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])->assertOk();

        $mairieTierce = Mairie::create(['nom' => 'Mairie tierce', 'ville' => 'Bafoussam']);
        $agentTierce = Agent::create([
            'nom' => 'Agent tiers',
            'email' => 'tiers-liste@civilpass.cm',
            'password' => 'password123',
            'mairie_id' => $mairieTierce->id,
            'role' => 'les_deux',
        ]);
        Sanctum::actingAs($agentTierce);

        $this->getJson('/api/agent/demandes')
            ->assertOk()
            ->assertJsonMissing(['id' => $demande->id]);
    }

    public function test_mairie_can_request_correction_and_citizen_can_resubmit_the_corrected_request(): void
    {
        $demande = $this->createDemande();
        $agentOrigine = Agent::where('email', 'origine@civilpass.cm')->firstOrFail();
        Sanctum::actingAs($agentOrigine);

        $this->postJson("/api/agent/demandes/{$demande->id}/demander-correction", [
            'motif' => 'Le numéro de l’acte doit être vérifié.',
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'correction_demandee')
            ->assertJsonPath('motif_statut', 'Le numéro de l’acte doit être vérifié.');

        $this->assertDatabaseHas('notifications', [
            'usager_id' => $this->usager->id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
        ]);

        Sanctum::actingAs($this->usager);
        $this->patchJson("/api/citoyen/demandes/{$demande->id}/correction", [
            'numero_acte' => 'NA-CORRIGE-42',
            'annee_acte' => 1998,
            'filiation' => [
                'pere_nom' => 'Père corrigé',
                'mere_nom' => 'Mère corrigée',
            ],
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'nouvelle')
            ->assertJsonPath('numero_acte', 'NA-CORRIGE-42')
            ->assertJsonPath('annee_acte', 1998)
            ->assertJsonPath('filiation.pere_nom', 'Père corrigé')
            ->assertJsonPath('filiation.mere_nom', 'Mère corrigée');

        $this->assertDatabaseHas('demandes', [
            'id' => $demande->id,
            'statut' => 'nouvelle',
            'numero_acte' => 'NA-CORRIGE-42',
            'annee_acte' => 1998,
            'motif_statut' => 'Les corrections ont été soumises. La demande attend une nouvelle vérification de la mairie d’origine.',
        ]);
        $this->assertDatabaseHas('filiations', [
            'demande_id' => $demande->id,
            'pere_nom' => 'Père corrigé',
            'mere_nom' => 'Mère corrigée',
        ]);
    }

    public function test_only_origin_mairie_can_request_correction_and_only_while_request_is_new(): void
    {
        $demande = $this->createDemande();
        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->firstOrFail());

        $this->postJson("/api/agent/demandes/{$demande->id}/demander-correction", [
            'motif' => 'Numéro d’acte invalide.',
        ])->assertForbidden();

        Sanctum::actingAs(Agent::where('email', 'origine@civilpass.cm')->firstOrFail());
        $this->postJson("/api/agent/demandes/{$demande->id}/valider", [
            'souche_retrouvee' => true,
        ])->assertOk();

        $this->postJson("/api/agent/demandes/{$demande->id}/demander-correction", [
            'motif' => 'Numéro d’acte invalide.',
        ])->assertStatus(409);
    }

    public function test_agent_scan_finds_demande_by_qr_token(): void
    {
        $demande = $this->createDemande();
        $token = $this->loginAs('origine@civilpass.cm');

        $this->withToken($token)
            ->postJson('/api/agent/scan', ['qr_token' => $demande->qr_token])
            ->assertOk()
            ->assertJsonPath('id', $demande->id);
    }

    private function createDemande(): Demande
    {
        $response = $this->postJson('/api/demandes', [
            'usager' => ['nom' => 'Test', 'prenom' => 'User', 'telephone' => '699000099'],
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'filiation' => ['pere_nom' => 'A', 'mere_nom' => 'B'],
        ]);

        return Demande::where('qr_token', $response->json('qr_token'))->firstOrFail();
    }

    private function loginAs(string $email): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'password123',
        ]);

        return $response->json('token');
    }
}
