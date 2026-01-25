import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';

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

// --- Simulation de Base de Données ---
let queue = [];

// --- ROUTES API ---
app.post('/api/queue/join', (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Numéro de téléphone requis" });
    const newUser = { id: Date.now().toString(), phone, status: 'waiting', timestamp: new Date().toISOString() };
    queue.push(newUser);
    io.emit('queue_updated', queue);
    res.status(201).json(newUser);
});

app.get('/api/queue', (req, res) => res.json(queue));

app.post('/api/queue/call', async (req, res) => {
    const nextWaitingIndex = queue.findIndex(q => q.status === 'waiting');
    if (nextWaitingIndex === -1) return res.status(404).json({ error: "Aucun client en attente" });

    queue[nextWaitingIndex].status = 'called';
    queue[nextWaitingIndex].calledAt = new Date().toISOString();
    const calledUser = queue[nextWaitingIndex];

    io.emit('client_called', calledUser);
    io.emit('queue_updated', queue);

    let formattedPhone = calledUser.phone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '+33' + formattedPhone.substring(1);

    try {
        await twilioClient.messages.create({
            body: "C'est votre tour au Marché MO ! Veuillez vous présenter au comptoir.",
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: formattedPhone
        });
        console.log(`✅ SMS envoyé à ${formattedPhone}`);
    } catch (error) {
        console.error("❌ Erreur Twilio:", error.message);
    }
    res.json(calledUser);
});

app.post('/api/queue/reset', (req, res) => {
    queue = [];
    io.emit('queue_updated', queue);
    res.json({ message: "File réinitialisée" });
});

// --- SERVICE DES FICHIERS FRONTEND ---
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}

// Pour Vercel : Exposer l'application Express
export default app;

// Ne lancer le listen que si on n'est pas sur Vercel
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`🚀 Serveur local en ligne sur le port ${PORT}`);
    });
}
