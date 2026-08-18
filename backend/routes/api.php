<?php

use App\Http\Controllers\Api\AgentDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\MairieController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques — côté usager / citoyen (pas d'authentification)
|--------------------------------------------------------------------------
*/
Route::get('/mairies', [MairieController::class, 'index']);
Route::get('/checklist/{typeDemande}', [ChecklistController::class, 'show']);

Route::post('/demandes', [DemandeController::class, 'store']);
Route::get('/demandes/{qrToken}', [DemandeController::class, 'show']);
Route::get('/demandes/{qrToken}/pdf', [DemandeController::class, 'pdf']);

/*
|--------------------------------------------------------------------------
| Authentification agent (Sanctum)
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes protégées — espace agent de mairie
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
});
