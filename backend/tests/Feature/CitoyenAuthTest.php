<?php

namespace Tests\Feature;

use App\Models\Usager;
use Database\Seeders\CivilPassSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CitoyenAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CivilPassSeeder::class);
    }

    /**
     * Test connexion citoyen
     */
    public function test_citoyen_login_returns_token(): void
    {
        $usager = Usager::create([
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'telephone' => '699111111',
            'email' => 'jean@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/citoyen/login', [
            'telephone' => '699111111',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['usager', 'token'])
            ->assertJsonPath('usager.id', $usager->id);
    }

    /**
     * Test connexion échouée avec identifiants invalides
     */
    public function test_citoyen_login_fails_with_invalid_credentials(): void
    {
        $this->postJson('/api/citoyen/login', [
            'telephone' => '699999999',
            'password' => 'wrongpassword',
        ])->assertUnprocessable();
    }

    /**
     * Test récupération profil connecté
     */
    public function test_citoyen_me_returns_current_user(): void
    {
        $usager = Usager::create([
            'nom' => 'Martin',
            'prenom' => 'Pierre',
            'telephone' => '699222222',
            'email' => 'pierre@example.com',
            'password' => bcrypt('password123'),
        ]);

        Sanctum::actingAs($usager);

        $this->getJson('/api/citoyen/me')
            ->assertOk()
            ->assertJsonPath('id', $usager->id)
            ->assertJsonPath('email', 'pierre@example.com');
    }

    /**
     * Test /citoyen/me sans authentification
     */
    public function test_citoyen_me_requires_authentication(): void
    {
        $this->getJson('/api/citoyen/me')->assertUnauthorized();
    }

    /**
     * Test récupération des demandes de l'usager
     */
    public function test_citoyen_mes_demandes_returns_user_requests(): void
    {
        $usager = Usager::create([
            'nom' => 'Bernard',
            'prenom' => 'Luc',
            'telephone' => '699333333',
            'email' => 'luc@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Créer des demandes pour cet usager
        $demande1 = $usager->demandes()->create([
            'qr_token' => 'QR-001',
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'numero_acte' => 'NA-001',
            'annee_acte' => 2024,
            'statut' => 'nouvelle',
                    'statut' => 'nouvelle',
        ]);

        $demande2 = $usager->demandes()->create([
            'qr_token' => 'QR-002',
            'mairie_origine_id' => 2,
            'mairie_retrait_id' => 1,
            'numero_acte' => 'NA-002',
            'annee_acte' => 2024,
            'statut' => 'validee',
                    'statut' => 'validee',
        ]);

        Sanctum::actingAs($usager);

        $this->getJson('/api/citoyen/demandes')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['qr_token' => 'QR-001'])
            ->assertJsonFragment(['qr_token' => 'QR-002']);
    }

    /**
     * Test déconnexion citoyen
     */
    public function test_citoyen_logout_invalidates_token(): void
    {
        $usager = Usager::create([
            'nom' => 'Lopez',
            'prenom' => 'Carlos',
            'telephone' => '699444444',
            'email' => 'carlos@example.com',
            'password' => bcrypt('password123'),
        ]);

        Sanctum::actingAs($usager);

        $response = $this->postJson('/api/citoyen/logout');

        $response->assertOk();

        // Le token ne devrait plus être valide
        $this->getJson('/api/citoyen/me')->assertUnauthorized();
    }
}
