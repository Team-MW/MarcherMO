import { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Play, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';


export default function ButcherAdmin() {
    const { queue, callNext } = useQueue(); // On garde accès aux fonctions du context
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

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ marginBottom: 0 }}>Tableau de Bord 🥩</h1>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link to="/analytics" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        <BarChart3 size={18} /> Stats
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Action & Waiting List */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Prochain Client</h3>
                        <button
                            onClick={handleCallNext}
                            disabled={waitingList.length === 0}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                fontSize: '1.25rem',
                                opacity: waitingList.length === 0 ? 0.5 : 1,
                                cursor: waitingList.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Play size={24} fill="currentColor" style={{ marginRight: '8px' }} />
                            {waitingList.length === 0 ? 'En attente de clients...' : 'APPELER LE PROCHAIN 🔔'}
                        </button>
                        <p style={{ marginTop: '1.5rem', color: 'var(--text-light)', fontWeight: '500' }}>
                            {waitingList.length} client(s) en attente 🕒
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <Users size={24} /> Liste d'attente
                        </h3>
                        <div style={{ marginTop: '1.5rem' }}>
                            <AnimatePresence>
                                {waitingList.map((client, index) => (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        style={{
                                            padding: '1.2rem',
                                            borderBottom: '1px solid var(--accent)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.5rem',
                                            background: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="badge badge-waiting">{index + 1}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{client.ticket_number || `#${client.id}`}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {waitingList.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                    <Users size={48} style={{ marginBottom: '1rem' }} />
                                    <p>La liste d'attente est vide</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: History */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <UserCheck size={24} /> Déjà appelés
                    </h3>
                    <div style={{ marginTop: '1.5rem' }}>
                        <AnimatePresence>
                            {calledList.map((client) => {
                                const calledTime = client.called_at || client.calledAt || client.timestamp;
                                return (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--accent)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>{client.ticket_number || `#${client.id}`}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', opacity: 0.8 }}>
                                                {calledTime && new Date(calledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="badge badge-called" style={{ opacity: 0.7 }}>Appelé ✅</div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {calledList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>Historique vide</p>}
                    </div>
                </div>
            </div>

            {/* Footer Microdidact */}
            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.4, fontSize: '0.9rem' }}>
                <a href="https://microdidact.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span>Réalisé par</span>
                    <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>MICRODIDACT</span>
                </a>
            </div>
        </div>
    );
}
