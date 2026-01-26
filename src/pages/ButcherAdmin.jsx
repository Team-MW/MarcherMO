import { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Play, RotateCcw, Phone, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';


export default function ButcherAdmin() {
    const { queue, callNext, resetQueue } = useQueue(); // On garde accès aux fonctions du context
    const [calledList, setCalledList] = useState([]);
    const [localWaitingList, setLocalWaitingList] = useState([]); // State local pour la file d'attente (fallback)

    // On utilise la liste locale si elle est remplie, sinon celle du contexte
    const waitingList = localWaitingList.length > 0 || calledList.length > 0 ? localWaitingList : queue.filter(q => q.status === 'waiting');

    // Fonction unifiée pour tout recharger depuis l'API
    const refreshAll = async () => {
        try {
            const isLocal = window.location.hostname === 'localhost';
            const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

            // 1. Charger l'historique (Appelés)
            const histRes = await axios.get(`${BASE_URL}/api/history?filter=today`);
            // L'API renvoie déjà par ordre décroissant (DESC), donc on ne reverse pas
            setCalledList(histRes.data.filter(q => q.status === 'called'));

            // 2. Charger la file d'attente (En attente)
            const queueRes = await axios.get(`${BASE_URL}/api/queue`);
            setLocalWaitingList(queueRes.data);

        } catch (error) {
            console.error("Erreur rafraîchissement polling:", error);
        }
    };

    // Écouter les mises à jour en temps réel + Polling
    useEffect(() => {
        const isLocal = window.location.hostname === 'localhost';
        const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

        const socket = io(BASE_URL, {
            transports: ['polling', 'websocket'],
            reconnection: true
        });

        // Socket events
        socket.on('queue_updated', refreshAll);
        socket.on('client_called', refreshAll);

        // FALLBACK: Actualisation automatique toutes les 3 secondes
        const pollingInterval = setInterval(refreshAll, 3000);

        // Appel initial
        refreshAll();

        return () => {
            socket.off('queue_updated');
            socket.off('client_called');
            socket.disconnect();
            clearInterval(pollingInterval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        window.location.reload();
    };

    // Fonction wrapper pour callNext qui rafraîchit tout après
    const handleCallNext = async () => {
        await callNext();
        setTimeout(refreshAll, 500);
    };

    // Wrapper pour reset
    const handleReset = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir tout réinitialiser ?")) {
            await resetQueue();
            setTimeout(refreshAll, 500);
        }
    };

    // Relancer le son sur la TV
    const handleReplaySound = () => {
        const isLocal = window.location.hostname === 'localhost';
        const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';
        const socket = io(BASE_URL);
        socket.emit('replay_sound');
        socket.disconnect(); // On se déconnecte juste après l'envoi pour ne pas garder de socket inutile ici
    };

    // Style commun pour les boutons
    const btnStyle = {
        padding: '0.8rem 1.2rem',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Ombre pour effet bouton
        textTransform: 'uppercase',
        fontSize: '0.9rem'
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Tableau de Bord Boucher</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleReplaySound} style={{ ...btnStyle, background: '#0ea5e9', color: 'white' }}>
                        🔊 Son
                    </button>
                    <Link to="/analytics" style={{ ...btnStyle, background: '#64748b', color: 'white', textDecoration: 'none' }}>
                        <BarChart3 size={18} /> Stats
                    </Link>
                    <button onClick={handleLogout} style={{ ...btnStyle, background: '#e2e8f0', color: '#475569' }}>
                        Déconnexion
                    </button>
                    <button onClick={handleReset} style={{ ...btnStyle, background: '#ef4444', color: 'white' }}>
                        <RotateCcw size={18} /> Reset
                    </button>
                </div>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Action & Waiting List */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#334155' }}>Prochain Client</h3>
                        <button
                            onClick={handleCallNext}
                            disabled={waitingList.length === 0}
                            style={{
                                ...btnStyle,
                                width: '100%',
                                padding: '1.5rem',
                                fontSize: '1.5rem',
                                justifyContent: 'center',
                                background: waitingList.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                boxShadow: waitingList.length === 0 ? 'none' : '0 10px 20px rgba(34, 197, 94, 0.3)',
                                transform: waitingList.length === 0 ? 'none' : 'translateY(-2px)',
                                opacity: waitingList.length === 0 ? 0.7 : 1
                            }}
                        >
                            <Play size={32} fill="currentColor" /> APPELER LE PROCHAIN
                        </button>
                        <p style={{ marginTop: '1.5rem', color: '#64748b', fontWeight: '500' }}>
                            {waitingList.length} client(s) en attente
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Liste d'attente
                        </h3>
                        {/* ... */}
                        <div style={{ marginTop: '1rem' }}>
                            <AnimatePresence>
                                {waitingList.map((client, index) => (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid #eee',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>{client.ticket_number || `#${client.id}`}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={12} /> {client.phone}
                                            </div>
                                        </div>
                                        <div className="badge badge-waiting">{index + 1}e</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {waitingList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>Aucun client en attente</p>}
                        </div>
                    </div>
                </div>

                {/* Right: History */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={20} /> Clients appelés
                    </h3>
                    <div style={{ marginTop: '1rem' }}>
                        <AnimatePresence>
                            {calledList.map((client) => {
                                // Support created_at (SQL) ou timestamp (legacy)
                                const calledTime = client.called_at || client.calledAt || client.timestamp;
                                return (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid #eee',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(22, 163, 74, 0.05)'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-light)', fontSize: '1.1rem' }}>{client.ticket_number || `#${client.id}`}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={12} /> {client.phone}
                                            </div>
                                            {calledTime && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Appelé à {new Date(calledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                        </div>
                                        <div className="badge badge-called">Appelé</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {calledList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>Historique vide</p>}
                    </div>
                </div>
            </div>

            {/* Footer Microdidact */}
            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
                <a href="https://microdidact.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span>Réalisé par</span>
                    <span style={{ fontWeight: 'bold' }}>MICRODIDACT</span>
                </a>
            </div>
        </div>
    );
}
