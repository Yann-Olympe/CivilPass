-- ============================================================
-- CivilPass Cameroun — Schéma de base de données (MySQL 8+)
-- ATL2026 — Orange Digital Center Douala
-- ============================================================

CREATE DATABASE IF NOT EXISTS civilpass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE civilpass;

-- ------------------------------------------------------------
-- 1. mairies
-- ------------------------------------------------------------
CREATE TABLE mairies (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    ville           VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. agents
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
-- 3. usagers — citoyens : identité complète, coordonnées, NUI + CNI, auth
-- ------------------------------------------------------------
CREATE TABLE usagers (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    -- 1. Identité
    prenom              VARCHAR(100) NOT NULL,
    nom                 VARCHAR(100) NOT NULL,
    date_naissance      DATE NOT NULL,
    lieu_naissance      VARCHAR(150) NOT NULL,
    sexe                ENUM('M', 'F') NOT NULL,
    nationalite         VARCHAR(100) NOT NULL DEFAULT 'Camerounaise',
    -- 2. Coordonnées
    email               VARCHAR(150) NOT NULL UNIQUE,
    telephone           VARCHAR(20) NOT NULL UNIQUE,
    adresse             VARCHAR(255) NOT NULL,
    ville               VARCHAR(100) NOT NULL,
    region              VARCHAR(100) NOT NULL,
    -- 3. Identification
    nui                 VARCHAR(30) NULL UNIQUE,
    cni_numero          VARCHAR(30) NULL,
    cni_recto_path      VARCHAR(255) NULL,
    cni_verso_path      VARCHAR(255) NULL,
    -- Auth
    google_id           VARCHAR(100) NULL UNIQUE,
    password            VARCHAR(255) NULL, -- nullable : comptes Google sans mot de passe local
    created_at          TIMESTAMP NULL DEFAULT NULL,
    updated_at          TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. demandes
-- ------------------------------------------------------------
CREATE TABLE demandes (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type_demande        ENUM('naissance') NOT NULL DEFAULT 'naissance',
    statut              ENUM(
                            'nouvelle',
                            'en_cours',
                            'validee',
                            'urgente',
                            'rejetee'
                        ) NOT NULL DEFAULT 'nouvelle',
    numero_acte         VARCHAR(50) NULL,
    annee_acte          SMALLINT NULL,
    qr_token            VARCHAR(64) NOT NULL UNIQUE,
    souche_retrouvee    BOOLEAN NULL,
    observation_origine TEXT NULL,
    motif_statut       TEXT NULL,
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
-- 5. filiations
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
-- 6. transferts
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
-- 7. notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mairie_id       BIGINT UNSIGNED NOT NULL,
    usager_id       BIGINT UNSIGNED NULL,
    demande_id      BIGINT UNSIGNED NOT NULL,
    type            VARCHAR(50) NOT NULL,
    message         VARCHAR(255) NOT NULL,
    lue             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NULL DEFAULT NULL,
    updated_at      TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (mairie_id) REFERENCES mairies(id) ON DELETE CASCADE,
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    FOREIGN KEY (usager_id) REFERENCES usagers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Données de démo (2 Mairies simulées)
-- ------------------------------------------------------------
INSERT INTO mairies (nom, ville, created_at, updated_at) VALUES
('Mairie de Douala 3e', 'Douala', NOW(), NOW()),
('Mairie de Yaoundé 1er', 'Yaoundé', NOW(), NOW());
