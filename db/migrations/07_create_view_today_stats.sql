-- =====================================================
-- VUE: v_today_stats
-- Statistiques du jour en temps réel
-- =====================================================

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
