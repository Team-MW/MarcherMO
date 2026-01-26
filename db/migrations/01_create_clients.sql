-- =====================================================
-- TABLE: clients
-- File d'attente des clients
-- =====================================================

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
