<?php

use App\Http\Controllers\Api\AgentDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\CitoyenAuthController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\MairieController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques — consultables sans authentification
|--------------------------------------------------------------------------
*/
Route::get('/mairies', [MairieController::class, 'index']);
Route::get('/checklist/{typeDemande}', [ChecklistController::class, 'show']);
Route::get('/demandes/{qrToken}', [DemandeController::class, 'show']);
Route::get('/demandes/{qrToken}/pdf', [DemandeController::class, 'pdf']);
Route::post('/citoyen/register', [CitoyenAuthController::class, 'register']);
Route::post('/citoyen/login', [CitoyenAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Espace citoyen (protégé) — connexion obligatoire avant de créer une demande
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('citoyen')->group(function () {
    Route::post('/logout', [CitoyenAuthController::class, 'logout']);
    Route::get('/me', [CitoyenAuthController::class, 'me']);
    Route::get('/demandes', [CitoyenAuthController::class, 'mesDemandes']);
});

// Création de demande : citoyen connecté requis
Route::middleware('auth:sanctum')->post('/demandes', [DemandeController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Authentification agent
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Espace agent de mairie (protégé)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('agent')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/demandes', [AgentDashboardController::class, 'index']);
    Route::get('/demandes/{demande}', [AgentDashboardController::class, 'show']);
    Route::post('/demandes/{demande}/valider', [AgentDashboardController::class, 'valider']);
    Route::post('/demandes/{demande}/recevoir', [AgentDashboardController::class, 'recevoir']);
    Route::post('/demandes/{demande}/remettre', [AgentDashboardController::class, 'remettre']);
    Route::post('/scan', [AgentDashboardController::class, 'scan']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/lue', [NotificationController::class, 'marquerLue']);
});
