-- ============================================================
-- CivilPass Cameroun — Schéma de base de données (MySQL 8+)
-- ATL2026 — Orange Digital Center Douala
-- MVP : pré-enrôlement acte de naissance + service inter-Mairies simulé
-- ============================================================

CREATE DATABASE IF NOT EXISTS civilpass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE civilpass;

-- ------------------------------------------------------------
-- 1. mairies — les deux Mairies simulées (origine / retrait)
-- ------------------------------------------------------------
CREATE TABLE mairies (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    ville           VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. agents — comptes des agents d'état civil (authentifiés)
-- ------------------------------------------------------------
CREATE TABLE agents (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    mairie_id       BIGINT UNSIGNED NOT NULL,
    role            ENUM('origine', 'retrait', 'les_deux') NOT NULL DEFAULT 'les_deux',
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (mairie_id) REFERENCES mairies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. usagers — les citoyens, authentifiés par téléphone + mot de passe
-- ------------------------------------------------------------
CREATE TABLE usagers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    telephone       VARCHAR(20) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. demandes — le coeur du système (pré-enrôlement / transfert)
-- ------------------------------------------------------------
CREATE TABLE demandes (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type_demande        ENUM('naissance') NOT NULL DEFAULT 'naissance',
    statut              ENUM(
                            'pre_enrolee',
                            'en_attente_validation_origine',
                            'validee_origine',
                            'transferee',
                            'disponible_retrait',
                            'remise'
                        ) NOT NULL DEFAULT 'pre_enrolee',
    numero_acte         VARCHAR(50) NULL,
    annee_acte          SMALLINT NULL,
    qr_token            VARCHAR(64) NOT NULL UNIQUE,
    souche_retrouvee    BOOLEAN NULL,
    observation_origine TEXT NULL,
    usager_id           BIGINT UNSIGNED NOT NULL,
    mairie_origine_id   BIGINT UNSIGNED NOT NULL,
    mairie_retrait_id   BIGINT UNSIGNED NOT NULL,
    date_creation       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NULL DEFAULT NULL,
    updated_at          TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (usager_id) REFERENCES usagers(id) ON DELETE CASCADE,
    FOREIGN KEY (mairie_origine_id) REFERENCES mairies(id),
    FOREIGN KEY (mairie_retrait_id) REFERENCES mairies(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. filiations — infos filiation liées à une demande de naissance
-- ------------------------------------------------------------
CREATE TABLE filiations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    demande_id      BIGINT UNSIGNED NOT NULL,
    pere_nom        VARCHAR(150) NULL,
    mere_nom        VARCHAR(150) NULL,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. transferts — suivi du transfert inter-Mairies (Volet 2)
-- ------------------------------------------------------------
CREATE TABLE transferts (
    id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    demande_id                  BIGINT UNSIGNED NOT NULL,
    statut                      ENUM('en_attente', 'valide', 'recu') NOT NULL DEFAULT 'en_attente',
    date_validation_origine     TIMESTAMP NULL DEFAULT NULL,
    date_reception_retrait      TIMESTAMP NULL DEFAULT NULL,
    created_at                  TIMESTAMP NULL DEFAULT NULL,
    updated_at                  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. notifications — alertes dashboard mairie (ex: dossier transféré/reçu)
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mairie_id       BIGINT UNSIGNED NOT NULL,
    demande_id      BIGINT UNSIGNED NOT NULL,
    type            VARCHAR(50) NOT NULL,
    message         VARCHAR(255) NOT NULL,
    lue             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (mairie_id) REFERENCES mairies(id) ON DELETE CASCADE,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Données de démo minimales (2 Mairies simulées)
-- ------------------------------------------------------------
INSERT INTO mairies (nom, ville, created_at, updated_at) VALUES
('Mairie de Douala 3e', 'Douala', NOW(), NOW()),
('Mairie de Yaoundé 1er', 'Yaoundé', NOW(), NOW());
