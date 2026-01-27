import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db/queries.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Configuration Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('Un client est connecté');

    socket.on('replay_sound', () => {
        console.log('🔊 Replaying sound requested by admin');
        io.emit('play_sound');
    });

    socket.on('disconnect', () => {
        console.log('Un client est déconnecté');
    });
});

// =====================================================
// ROUTES API AVEC BASE DE DONNÉES
// =====================================================

/**
 * POST /api/queue/join
 * Ajouter un client à la file d'attente
 */
app.post('/api/queue/join', async (req, res) => {
    console.log('[API] Join request received:', req.body);
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "Numéro de téléphone requis" });
        }

        // Ajouter le client dans la base de données
        const newClient = await db.joinQueue(phone);

        // Récupérer la file complète et émettre via Socket.io
        const queue = await db.getQueue();
        io.emit('queue_updated', queue);

        res.status(201).json({
            id: newClient.id,
            phone: newClient.phone,
            status: newClient.status,
            timestamp: newClient.created_at,
            ticketNumber: newClient.ticket_number
        });
    } catch (error) {
        console.error('❌ Erreur /api/queue/join:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/queue
 * Récupérer la file d'attente complète
 */
app.get('/api/queue', async (req, res) => {
    try {
        const queue = await db.getQueue();

        // Formater les données pour le frontend
        const formattedQueue = queue.map(client => ({
            id: client.id,
            phone: client.phone,
            status: client.status,
            timestamp: client.created_at,
            ticketNumber: client.ticket_number,
            calledAt: client.called_at
        }));

        res.json(formattedQueue);
    } catch (error) {
        console.error('❌ Erreur /api/queue:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/queue/call
 * Appeler le prochain client en attente
 */
app.post('/api/queue/call', async (req, res) => {
    console.log('[API] Call next client requested');
    try {
        // Appeler le prochain client
        const calledClient = await db.callNextClient();
        console.log('[API] Called client result:', calledClient);

        if (!calledClient) {
            console.log('[API] No client to call (queue empty or error)');
            return res.status(404).json({ error: "Aucun client en attente" });
        }

        // Formater le numéro de téléphone
        let formattedPhone = calledClient.phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+33' + formattedPhone.substring(1);
        }

        // Envoyer le SMS
        try {
            const message = await twilioClient.messages.create({
                body: `C'est votre tour au Marché MO ! (Ticket ${calledClient.ticket_number}). Veuillez vous présenter au comptoir.`,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: formattedPhone
            });

            console.log(`✅ SMS envoyé à ${formattedPhone}`);

            // Logger le SMS dans la base de données
            await db.logSMS(
                calledClient.id,
                formattedPhone,
                `C'est votre tour au Marché MO ! (Ticket ${calledClient.ticket_number}). Veuillez vous présenter au comptoir.`,
                message.sid,
                'sent'
            );
        } catch (twilioError) {
            console.error("❌ Erreur Twilio:", twilioError.message);

            // Logger l'erreur SMS
            await db.logSMS(
                calledClient.id,
                formattedPhone,
                `C'est votre tour au Marché MO ! (Ticket ${calledClient.ticket_number}). Veuillez vous présenter au comptoir.`,
                null,
                'failed',
                twilioError.message
            );
        }

        // Émettre les événements Socket.io
        const queue = await db.getQueue();
        io.emit('client_called', {
            id: calledClient.id,
            phone: calledClient.phone,
            status: calledClient.status,
            timestamp: calledClient.created_at,
            ticketNumber: calledClient.ticket_number,
            calledAt: calledClient.called_at
        });
        io.emit('queue_updated', queue);

        res.json({
            id: calledClient.id,
            phone: calledClient.phone,
            status: calledClient.status,
            timestamp: calledClient.created_at,
            ticketNumber: calledClient.ticket_number,
            calledAt: calledClient.called_at
        });
    } catch (error) {
        console.error('❌ Erreur /api/queue/call:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/queue/reset
 * Réinitialiser la file d'attente (annuler tous les clients en attente)
 */
app.post('/api/queue/reset', async (req, res) => {
    console.log('⚠️ [API] Reset queue requested!');
    try {
        const affectedRows = await db.resetQueue();
        console.log(`⚠️ [API] Queue reset! ${affectedRows} clients cancelled.`);


        // Émettre la mise à jour
        const queue = await db.getQueue();
        io.emit('queue_updated', queue);

        res.json({
            message: "File réinitialisée",
            affectedRows
        });
    } catch (error) {
        console.error('❌ Erreur /api/queue/reset:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/queue/hard-reset
 * SUPPRESSION TOTALE des données du jour (Remise à zéro compteur)
 */
app.post('/api/queue/hard-reset', async (req, res) => {
    console.log('🔥 [API] HARD RESET TODAY requested!');
    try {
        const affectedRows = await db.hardResetToday();
        console.log(`🔥 [API] Hard Reset done! ${affectedRows} rows deleted.`);

        // Émettre la mise à jour massive
        const queue = await db.getQueue(); // Devrait être vide
        io.emit('queue_updated', queue);

        // On peut aussi émettre un événement spécifique si besoin pour forcer le reload
        io.emit('hard_reset_triggered');

        res.json({
            message: "Journée réinitialisée avec succès. Compteur remis à 0.",
            affectedRows
        });
    } catch (error) {
        console.error('❌ Erreur /api/queue/hard-reset:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/stats
 * Récupérer les statistiques (optionnel - pour le dashboard admin)
 */
app.get('/api/stats', async (req, res) => {
    try {
        const { filter = 'today' } = req.query;
        const stats = await db.getStats(filter);

        res.json({
            totalClients: stats.totalClients || 0,
            totalCalled: stats.totalCalled || 0,
            avgWaitMinutes: stats.avgWaitMinutes || 0
        });
    } catch (error) {
        console.error('❌ Erreur /api/stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/history
 * Récupérer l'historique des clients (optionnel)
 */
app.get('/api/history', async (req, res) => {
    try {
        const { filter = 'today' } = req.query;
        const history = await db.getHistory(filter);

        res.json(history);
    } catch (error) {
        console.error('❌ Erreur /api/history:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =====================================================
// SERVICE DES FICHIERS FRONTEND
// =====================================================
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    // Servir index.html pour toutes les routes non-API (SPA)
    app.use((req, res, next) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        } else {
            next();
        }
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur Marché MO (Front + Back) en ligne sur le port ${PORT}`);
    console.log(`🗄️  Base de données PlanetScale connectée`);
});
