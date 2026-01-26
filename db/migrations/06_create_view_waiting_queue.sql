-- =====================================================
-- VUE: v_waiting_queue
-- File d'attente en temps réel
-- =====================================================

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
