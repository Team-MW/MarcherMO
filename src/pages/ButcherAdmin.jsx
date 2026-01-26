import { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Play, RotateCcw, Phone, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function ButcherAdmin() {
    const { queue, callNext, resetQueue } = useQueue(); // queue vient du contexte (socket global)
    const [calledList, setCalledList] = useState([]);

    // La file d'attente (waiting) vient du context (temps réel)
    const waitingList = queue.filter(q => q.status === 'waiting');

    // Charger l'historique des appelés
    const fetchHistory = async () => {
        try {
            const isLocal = window.location.hostname === 'localhost';
            const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';
            const response = await axios.get(`${BASE_URL}/api/history?filter=today`);
            const called = response.data.filter(q => q.status === 'called').reverse();
            setCalledList(called);
        } catch (error) {
            console.error("Erreur chargement historique:", error);
        }
    };

    // Écouter les mises à jour en temps réel pour l'historique aussi
    useEffect(() => {
        const isLocal = window.location.hostname === 'localhost';
        const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

        const socket = io(BASE_URL, {
            transports: ['polling', 'websocket'],
            reconnection: true
        });

        // Quand la file change (quelqu'un rejoint ou est appelé)
        socket.on('queue_updated', () => {
            fetchHistory(); // Rafraîchir l'historique
        });

        // Quand un client est appelé spécifiquement
        socket.on('client_called', () => {
            fetchHistory();
        });

        return () => {
            socket.off('queue_updated');
            socket.off('client_called');
            socket.disconnect();
        };
    }, []);

    // Charger au démarrage et quand la file locale change
    useEffect(() => {
        fetchHistory();
    }, [queue]);

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        window.location.reload();
    };

    // Fonction wrapper pour callNext qui rafraîchit l'historique après
    const handleCallNext = async () => {
        await callNext();
        setTimeout(fetchHistory, 500); // Petit délai pour laisser le temps à la DB de mettre à jour
    };

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Tableau de Bord Boucher</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/analytics" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        <BarChart3 size={18} /> Statistiques
                    </Link>
                    <button onClick={handleLogout} className="btn" style={{ background: '#eee', color: '#666' }}>
                        Déconnexion
                    </button>
                    <button onClick={resetQueue} className="btn" style={{ background: '#fee2e2', color: '#991b1b' }}>
                        <RotateCcw size={18} /> Réinitialiser
                    </button>
                </div>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Action & Waiting List */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Prochain Client</h3>
                        <button
                            onClick={handleCallNext}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '2rem', fontSize: '1.5rem' }}
                            disabled={waitingList.length === 0}
                        >
                            <Play size={32} /> Appeler le prochain
                        </button>
                        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
                            {waitingList.length} client(s) en attente
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Liste d'attente
                        </h3>
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
        </div>
    );
}
