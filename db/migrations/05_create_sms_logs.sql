-- =====================================================
-- TABLE: sms_logs
-- Historique des SMS envoyés
-- =====================================================

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
