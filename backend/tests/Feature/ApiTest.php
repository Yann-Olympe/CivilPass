<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Demande;
use Database\Seeders\CivilPassSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CivilPassSeeder::class);
    }

    public function test_mairies_returns_demo_data(): void
    {
        $response = $this->getJson('/api/mairies');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['ville' => 'Douala'])
            ->assertJsonFragment(['ville' => 'Yaoundé']);
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
            ->assertJsonPath('statut', 'en_attente_validation_origine')
            ->assertJsonStructure(['qr_token', 'usager', 'filiation', 'mairie_origine', 'mairie_retrait']);
    }

    public function test_show_demande_by_qr_token(): void
    {
        $demande = $this->createDemande();

        $this->getJson("/api/demandes/{$demande->qr_token}")
            ->assertOk()
            ->assertJsonPath('id', $demande->id);
    }

    public function test_pdf_download_returns_pdf(): void
    {
        $demande = $this->createDemande();

        $response = $this->get("/api/demandes/{$demande->qr_token}/pdf");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
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
        $this->postJson("/api/agent/demandes/{$demande->id}/valider")
            ->assertOk()
            ->assertJsonPath('demande.statut', 'transferee');

        Sanctum::actingAs(Agent::where('email', 'retrait@civilpass.cm')->first());
        $this->postJson("/api/agent/demandes/{$demande->id}/recevoir")
            ->assertOk()
            ->assertJsonPath('statut', 'disponible_retrait');

        $this->postJson("/api/agent/demandes/{$demande->id}/remettre")
            ->assertOk()
            ->assertJsonPath('statut', 'remise');
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
