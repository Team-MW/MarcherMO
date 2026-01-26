import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function ScoreDisplay() {
    const [lastCalled, setLastCalled] = useState(null);
    const [isNewCall, setIsNewCall] = useState(false);

    // Charger le dernier appelé au démarrage
    useEffect(() => {
        const fetchLastCalled = async () => {
            try {
                const isLocal = window.location.hostname === 'localhost';
                const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';
                const response = await axios.get(`${BASE_URL}/api/history?filter=today`);

                // Prendre le plus récent des "called"
                const called = response.data.filter(q => q.status === 'called');
                if (called.length > 0) {
                    // Trier par date d'appel (le plus récent en dernier)
                    called.sort((a, b) => {
                        const dateA = a.called_at || a.calledAt || a.timestamp;
                        const dateB = b.called_at || b.calledAt || b.timestamp;
                        return new Date(dateA) - new Date(dateB);
                    });
                    setLastCalled(called[called.length - 1]);
                }
            } catch (error) {
                console.error("Erreur chargement dernier appelé:", error);
            }
        };

        fetchLastCalled();

        // Écouter les mises à jour en temps réel via Socket
        const isLocal = window.location.hostname === 'localhost';
        const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

        const socket = io(BASE_URL, {
            transports: ['polling', 'websocket'],
            reconnection: true
        });

        socket.on('client_called', (client) => {
            setLastCalled(client);
            setIsNewCall(true);
            const timer = setTimeout(() => setIsNewCall(false), 8000);
            return () => clearTimeout(timer);
        });

        return () => {
            socket.off('client_called');
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            overflow: 'hidden',
            padding: '2rem'
        }}>
            <AnimatePresence mode="wait">
                {lastCalled ? (
                    <motion.div
                        key={lastCalled.id}
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{
                            opacity: 1,
                            scale: isNewCall ? [1, 1.1, 1] : 1,
                            y: 0
                        }}
                        transition={{
                            duration: 0.8,
                            scale: { duration: 0.5, repeat: isNewCall ? 3 : 0 }
                        }}
                        style={{ textAlign: 'center' }}
                    >
                        <p style={{
                            fontSize: '4rem',
                            fontWeight: 600,
                            color: 'var(--text-light)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5rem',
                            marginBottom: '2rem'
                        }}>
                            Appel en cours
                        </p>

                        <div style={{
                            background: 'var(--text)',
                            color: '#fff',
                            padding: '4rem 8rem',
                            borderRadius: '60px',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                            border: '10px solid var(--secondary)',
                            display: 'inline-block'
                        }}>
                            <span style={{
                                fontSize: '20rem',
                                fontWeight: 900,
                                lineHeight: 1,
                                fontFamily: 'Outfit, sans-serif'
                            }}>
                                {lastCalled.ticket_number || lastCalled.ticketNumber || `#${lastCalled.id}`}
                            </span>
                        </div>

                        {isNewCall && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
                            >
                                <Bell size={60} color="var(--secondary)" className="floating" />
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    Veuillez avancer au comptoir
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h1 style={{ fontSize: '6rem', color: '#eee' }}>Prêt pour le service</h1>
                        <p style={{ fontSize: '2rem', color: '#ccc' }}>En attente du prochain client...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer minimaliste */}
            <div style={{ position: 'absolute', bottom: '4rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h2 style={{ fontSize: '3rem', color: 'var(--primary)', opacity: 0.2 }}>MARCHÉ MO</h2>
            </div>
        </div>
    );
}
