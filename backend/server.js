const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // En production, mettez l'URL de votre front Vercel
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- Simulation de Base de Données (À remplacer par MongoDB/PostgreSQL) ---
let queue = [];
// --------------------------------------------------------------------------

// Route pour rejoindre la file d'attente
app.post('/api/queue/join', (req, res) => {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ error: "Numéro de téléphone requis" });

    const newUser = {
        id: Date.now().toString(),
        phone,
        status: 'waiting',
        timestamp: new Date().toISOString()
    };

    queue.push(newUser);

    // Informer tout le monde qu'un nouveau client est arrivé
    io.emit('queue_updated', queue);

    res.status(201).json(newUser);
});

// Route pour récupérer la file
app.get('/api/queue', (req, res) => {
    res.json(queue);
});

// Route pour appeler le prochain client
app.post('/api/queue/call', (req, res) => {
    const nextWaitingIndex = queue.findIndex(q => q.status === 'waiting');

    if (nextWaitingIndex === -1) {
        return res.status(404).json({ error: "Aucun client en attente" });
    }

    queue[nextWaitingIndex].status = 'called';
    const calledUser = queue[nextWaitingIndex];

    // Socket: Notifier spécifiquement ce client ou rafraîchir tout le monde
    io.emit('client_called', calledUser);
    io.emit('queue_updated', queue);

    // ICI : Logique d'envoi de SMS (SMSmode par exemple)
    console.log(`SIMULATION SMS -> ${calledUser.phone} : C'est votre tour au Marché MO !`);

    res.json(calledUser);
});

// Route pour réinitialiser la file
app.post('/api/queue/reset', (req, res) => {
    queue = [];
    io.emit('queue_updated', queue);
    res.json({ message: "File réinitialisée" });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Serveur Marché MO en ligne sur le port ${PORT}`);
});
