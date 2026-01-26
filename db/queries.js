/**
 * Requêtes SQL pour le système de file d'attente Marché MO
 * Compatible MySQL (PlanetScale)
 */

import { query } from './connection.js';

// =====================================================
// GESTION DE LA FILE D'ATTENTE
// =====================================================

/**
 * Générer le prochain numéro de ticket pour aujourd'hui
 */
/**
 * Générer le prochain numéro de ticket pour aujourd'hui
 */
export const generateTicketNumber = async () => {
    try {
        const result = await query(
            'SELECT COUNT(*) as count FROM clients WHERE DATE(created_at) = CURDATE()'
        );
        console.log('[DB] Count result:', result);
        const nextNum = (result[0]?.count || 0) + 1;
        const ticket = `#${String(nextNum).padStart(4, '0')}`;
        console.log('[DB] Generated ticket:', ticket);
        return ticket;
    } catch (e) {
        console.error('[DB] Error generating ticket:', e);
        throw e;
    }
};

/**
 * Ajouter un client à la file d'attente
 */
export const joinQueue = async (phone) => {
    console.log('[DB] Joining queue with phone:', phone);
    const ticketNumber = await generateTicketNumber();

    const result = await query(
        'INSERT INTO clients (ticket_number, phone, status) VALUES (?, ?, ?)',
        [ticketNumber, phone, 'waiting']
    );
    console.log('[DB] Insert result:', result);

    // Récupérer le client créé
    const [client] = await query(
        'SELECT * FROM clients WHERE id = ?',
        [result.insertId]
    );
    console.log('[DB] Created client:', client);

    return client;
};

/**
 * Récupérer toute la file d'attente
 */
export const getQueue = async () => {
    const rows = await query(
        `SELECT 
      id,
      ticket_number,
      phone,
      status,
      created_at,
      called_at,
      TIMESTAMPDIFF(MINUTE, created_at, NOW()) as wait_minutes
    FROM clients 
    WHERE status = 'waiting'
    ORDER BY created_at ASC`
    );
    console.log('[DB] Queue fetched, count:', rows.length);
    return rows;
};

/**
 * Appeler le prochain client dans la file
 */
export const callNextClient = async () => {
    // Récupérer le premier client en attente
    const [firstClient] = await query(
        `SELECT id FROM clients 
     WHERE status = 'waiting' 
     ORDER BY created_at ASC 
     LIMIT 1`
    );

    if (!firstClient) {
        return null;
    }

    // Mettre à jour son statut
    await query(
        'UPDATE clients SET status = ?, called_at = NOW() WHERE id = ?',
        ['called', firstClient.id]
    );

    // Retourner le client mis à jour
    const [updatedClient] = await query(
        'SELECT * FROM clients WHERE id = ?',
        [firstClient.id]
    );

    return updatedClient;
};

/**
 * Réinitialiser la file d'attente (annuler tous les clients en attente)
 */
export const resetQueue = async () => {
    const result = await query(
        'UPDATE clients SET status = ? WHERE status = ?',
        ['cancelled', 'waiting']
    );

    return result.affectedRows;
};

/**
 * Annuler un client spécifique
 */
export const cancelClient = async (ticketNumber) => {
    const result = await query(
        'UPDATE clients SET status = ? WHERE ticket_number = ? AND status = ?',
        ['cancelled', ticketNumber, 'waiting']
    );

    return result.affectedRows > 0;
};

// =====================================================
// STATISTIQUES
// =====================================================

/**
 * Obtenir les statistiques selon le filtre de temps
 * @param {string} filterRange - 'today', '7days', '30days', 'all'
 */
export const getStats = async (filterRange = 'today') => {
    let dateFilter = '';

    switch (filterRange) {
        case 'today':
            dateFilter = 'WHERE DATE(created_at) = CURDATE()';
            break;
        case '7days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            break;
        case '30days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            break;
        case 'all':
        default:
            dateFilter = '';
    }

    const stats = await query(`
    SELECT 
      COUNT(*) as totalClients,
      SUM(CASE WHEN status = 'called' THEN 1 ELSE 0 END) as totalCalled,
      ROUND(AVG(CASE 
        WHEN called_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, created_at, called_at) 
        ELSE NULL 
      END)) as avgWaitMinutes
    FROM clients 
    ${dateFilter}
  `);

    return stats[0];
};

/**
 * Obtenir l'historique détaillé des clients
 */
export const getHistory = async (filterRange = 'today') => {
    let dateFilter = '';

    switch (filterRange) {
        case 'today':
            dateFilter = 'WHERE DATE(created_at) = CURDATE()';
            break;
        case '7days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            break;
        case '30days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            break;
        case 'all':
        default:
            dateFilter = '';
    }

    return await query(`
    SELECT 
      id,
      ticket_number,
      phone,
      status,
      created_at,
      called_at,
      CASE 
        WHEN called_at IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, created_at, called_at) 
        ELSE NULL 
      END as wait_minutes
    FROM clients 
    ${dateFilter}
    ORDER BY created_at DESC
  `);
};

/**
 * Obtenir les données pour le graphique par heure
 */
export const getHourlyData = async (filterRange = 'today') => {
    let dateFilter = '';

    switch (filterRange) {
        case 'today':
            dateFilter = 'WHERE DATE(created_at) = CURDATE()';
            break;
        case '7days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            break;
        case '30days':
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
            break;
        case 'all':
        default:
            dateFilter = '';
    }

    return await query(`
    SELECT 
      HOUR(created_at) as hour,
      COUNT(*) as count
    FROM clients 
    ${dateFilter}
    GROUP BY HOUR(created_at)
    ORDER BY HOUR(created_at)
  `);
};

// =====================================================
// LOGS SMS
// =====================================================

/**
 * Enregistrer un log SMS
 */
export const logSMS = async (clientId, phone, message, twilioSid = null, status = 'sent', errorMessage = null) => {
    await query(
        `INSERT INTO sms_logs (client_id, phone, message, twilio_sid, status, error_message) 
     VALUES (?, ?, ?, ?, ?, ?)`,
        [clientId, phone, message, twilioSid, status, errorMessage]
    );
};

/**
 * Récupérer les logs SMS récents
 */
export const getSMSLogs = async (limit = 50) => {
    return await query(
        `SELECT * FROM sms_logs 
     ORDER BY sent_at DESC 
     LIMIT ?`,
        [limit]
    );
};

// =====================================================
// ADMIN
// =====================================================

/**
 * Vérifier les credentials admin
 */
export const verifyAdmin = async (pinCode) => {
    const [admin] = await query(
        'SELECT * FROM admin_users WHERE pin_code = ? AND is_active = TRUE',
        [pinCode]
    );

    return admin || null;
};

/**
 * Créer un nouvel utilisateur admin
 */
export const createAdmin = async (username, pinCode, role = 'butcher') => {
    const result = await query(
        'INSERT INTO admin_users (username, pin_code, role) VALUES (?, ?, ?)',
        [username, pinCode, role]
    );

    return result.insertId;
};
