-- =====================================================
-- TABLE: daily_stats
-- Statistiques quotidiennes
-- =====================================================

CREATE TABLE daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_clients INT DEFAULT 0,
    total_called INT DEFAULT 0,
    avg_wait_minutes INT DEFAULT 0,
    peak_hour INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_stat_date (stat_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
