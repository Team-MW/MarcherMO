-- =====================================================
-- SCHÉMA BASE DE DONNÉES - MARCHÉ MO
-- Base: MySQL (PlanetScale)
-- =====================================================

-- Table principale : File d'attente des clients
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(10) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME NULL,
    
    -- Index pour performances
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_called_at (called_at DESC),
    INDEX idx_phone (phone),
    
    -- Contraintes
    CONSTRAINT chk_status CHECK (status IN ('waiting', 'called', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table : Statistiques quotidiennes (pour graphiques)
CREATE TABLE daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_clients INT DEFAULT 0,
    total_called INT DEFAULT 0,
    avg_wait_minutes INT DEFAULT 0,
    peak_hour INT NULL, -- Heure de pointe (0-23)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_stat_date (stat_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table : Utilisateurs Admin (optionnel pour multi-bouchers)
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    pin_code VARCHAR(6) NOT NULL, -- Code à 6 chiffres
    role VARCHAR(20) DEFAULT 'butcher',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer le compte admin par défaut
INSERT INTO admin_users (username, pin_code, role) 
VALUES ('admin', '000000', 'owner');

-- Table : Logs SMS (pour suivi Twilio)
CREATE TABLE sms_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    twilio_sid VARCHAR(100) NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    
    INDEX idx_client_id (client_id),
    INDEX idx_sent_at (sent_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VUES PRATIQUES
-- =====================================================

-- Vue : Clients en attente (triés par ordre d'arrivée)
CREATE OR REPLACE VIEW v_waiting_queue AS
SELECT 
    id,
    ticket_number,
    phone,
    created_at,
    TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS wait_minutes
FROM clients
WHERE status = 'waiting'
ORDER BY created_at ASC;

-- Vue : Statistiques du jour
CREATE OR REPLACE VIEW v_today_stats AS
SELECT 
    COUNT(*) AS total_clients,
    SUM(CASE WHEN status = 'called' THEN 1 ELSE 0 END) AS total_called,
    ROUND(AVG(CASE 
        WHEN called_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, created_at, called_at) 
        ELSE NULL 
    END)) AS avg_wait_minutes,
    (SELECT HOUR(created_at) as hour
     FROM clients
     WHERE DATE(created_at) = CURDATE()
     GROUP BY HOUR(created_at)
     ORDER BY COUNT(*) DESC
     LIMIT 1) AS peak_hour
FROM clients
WHERE DATE(created_at) = CURDATE();

-- =====================================================
-- REQUÊTES EXEMPLE POUR L'APPLICATION
-- =====================================================

-- 1. Rejoindre la file d'attente
-- INSERT INTO clients (ticket_number, phone) VALUES ('#0001', '+33612345678');

-- 2. Récupérer la file d'attente
-- SELECT * FROM v_waiting_queue;

-- 3. Appeler le prochain client
-- UPDATE clients 
-- SET status = 'called', called_at = NOW() 
-- WHERE id = (SELECT id FROM v_waiting_queue LIMIT 1);

-- 4. Réinitialiser la file
-- UPDATE clients SET status = 'cancelled' WHERE status = 'waiting';

-- 5. Statistiques des 30 derniers jours
-- SELECT * FROM clients 
-- WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
-- ORDER BY created_at DESC;
