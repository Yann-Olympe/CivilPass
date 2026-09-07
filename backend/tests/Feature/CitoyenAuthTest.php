<?php

namespace Tests\Feature;

use App\Models\Usager;
use App\Models\Demande;
use App\Models\Notification;
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

    public function test_citoyen_can_update_profile_partially(): void
    {
        $usager = Usager::create([
            'nom' => 'Fezo',
            'prenom' => 'Emmanuel',
            'telephone' => '699666666',
            'email' => 'emmanuel@example.com',
            'lieu_naissance' => 'Yaoundé',
            'sexe' => 'M',
            'adresse' => 'Quartier Bastos',
            'ville' => 'Yaoundé',
            'region' => 'Centre',
            'password' => bcrypt('password123'),
        ]);

        Sanctum::actingAs($usager);

        $this->patchJson('/api/citoyen/profil', [
            'email' => 'emmanuel.fezo@example.com',
            'adresse' => 'Rue 1.850',
        ])
            ->assertOk()
            ->assertJsonPath('usager.email', 'emmanuel.fezo@example.com')
            ->assertJsonPath('usager.adresse', 'Rue 1.850')
            ->assertJsonMissingPath('usager.password');

        $this->assertDatabaseHas('usagers', [
            'id' => $usager->id,
            'email' => 'emmanuel.fezo@example.com',
            'adresse' => 'Rue 1.850',
        ]);
    }

    public function test_citoyen_can_filter_and_mark_notifications_as_read(): void
    {
        $usager = Usager::create([
            'nom' => 'Nkom',
            'prenom' => 'Paul',
            'telephone' => '699777777',
            'email' => 'paul@example.com',
            'lieu_naissance' => 'Douala',
            'sexe' => 'M',
            'adresse' => 'Rue 3',
            'ville' => 'Douala',
            'region' => 'Littoral',
            'password' => bcrypt('password123'),
        ]);
        $demande = Demande::create([
            'usager_id' => $usager->id,
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'qr_token' => 'QR-NOTIF-001',
            'statut' => 'nouvelle',
        ]);
        $nonLue = Notification::create([
            'mairie_id' => 1,
            'usager_id' => $usager->id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
            'message' => 'Votre demande est nouvelle.',
        ]);
        Notification::create([
            'mairie_id' => 1,
            'usager_id' => $usager->id,
            'demande_id' => $demande->id,
            'type' => 'statut_demande',
            'message' => 'Notification déjà lue.',
            'lue' => true,
        ]);

        Sanctum::actingAs($usager);

        $this->getJson('/api/citoyen/notifications?lue=0')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $nonLue->id);

        $this->patchJson("/api/citoyen/notifications/{$nonLue->id}/lue")
            ->assertOk()
            ->assertJsonPath('lue', true)
            ->assertJsonPath('demande.id', $demande->id);
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

    public function test_citoyen_dashboard_returns_summary_alert_and_monthly_statistics(): void
    {
        $usager = Usager::create([
            'nom' => 'Diallo',
            'prenom' => 'Awa',
            'telephone' => '699555555',
            'email' => 'awa@example.com',
            'lieu_naissance' => 'Douala',
            'sexe' => 'F',
            'adresse' => 'Rue 1',
            'ville' => 'Douala',
            'region' => 'Littoral',
            'password' => bcrypt('password123'),
        ]);

        Demande::create([
            'usager_id' => $usager->id,
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'qr_token' => 'QR-DASH-001',
            'statut' => 'en_cours',
            'date_creation' => now()->startOfMonth(),
        ]);
        Demande::create([
            'usager_id' => $usager->id,
            'mairie_origine_id' => 1,
            'mairie_retrait_id' => 2,
            'qr_token' => 'QR-DASH-002',
            'statut' => 'validee',
            'date_creation' => now()->startOfMonth(),
        ]);

        Sanctum::actingAs($usager);

        $this->getJson('/api/citoyen/dashboard')
            ->assertOk()
            ->assertJsonPath('compteurs.en_cours', 1)
            ->assertJsonPath('compteurs.pret_a_retirer', 1)
            ->assertJsonPath('compteurs.historique', 2)
            ->assertJsonPath('alerte.demande_id', 2)
            ->assertJsonCount(12, 'statistiques.demandes_par_mois');
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
