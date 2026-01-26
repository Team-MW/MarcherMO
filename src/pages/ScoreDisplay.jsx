import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Bell, List, Users } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import notificationSound from '../assets/son.mp3';

export default function ScoreDisplay() {
    const [lastCalled, setLastCalled] = useState(null);
    const [waitingList, setWaitingList] = useState([]);
    const [isNewCall, setIsNewCall] = useState(false);

    // Référence pour le son pour éviter de le recréer à chaque render
    // Note: Le navigateur bloquera le son tant que l'utilisateur n'a pas interagi avec la page (clic)
    const audioRef = useRef(new Audio(notificationSound));

    const refreshData = async () => {
        try {
            const isLocal = window.location.hostname === 'localhost';
            const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

            // 1. Chercher le dernier appelé
            const histRes = await axios.get(`${BASE_URL}/api/history?filter=today`);
            const called = histRes.data.filter(q => q.status === 'called');
            if (called.length > 0) {
                // Trier pour avoir le plus récent
                called.sort((a, b) => {
                    const dateA = a.called_at || a.calledAt || a.timestamp;
                    const dateB = b.called_at || b.calledAt || b.timestamp;
                    return new Date(dateA) - new Date(dateB);
                });
                const latest = called[called.length - 1];

                setLastCalled(prev => {
                    // Si c'est un nouveau client (ID différent), on déclenche l'effet
                    if (latest && prev?.id !== latest.id) {
                        setIsNewCall(true);
                        // Jouer le son
                        // IMPORTANT: Nécessite une interaction utilisateur préalable sur la page
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(e => console.log("Audio autoplay bloqué (cliquez sur la page pour activer le son):", e));

                        setTimeout(() => setIsNewCall(false), 8000);
                    }
                    return latest;
                });
            }

            // 2. Chercher la liste d'attente
            const queueRes = await axios.get(`${BASE_URL}/api/queue`);
            setWaitingList(queueRes.data);

        } catch (error) {
            console.error("Erreur ScoreDisplay:", error);
        }
    };

    useEffect(() => {
        const isLocal = window.location.hostname === 'localhost';
        const BASE_URL = isLocal ? 'http://localhost:3001' : 'https://marchermo.onrender.com';

        const socket = io(BASE_URL, {
            transports: ['polling', 'websocket'],
            reconnection: true
        });

        socket.on('client_called', refreshData);
        socket.on('queue_updated', refreshData);

        // Polling de sécurité
        const interval = setInterval(refreshData, 3000);

        // Appel initial
        refreshData();

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, []);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr', // 2/3 écran pour appel, 1/3 pour liste
            background: '#f8f9fa',
            overflow: 'hidden'
        }}>
            {/* GAUCHE : APPEL EN COURS */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                position: 'relative',
                boxShadow: '10px 0 30px rgba(0,0,0,0.05)',
                zIndex: 2
            }}>
                <AnimatePresence mode="wait">
                    {lastCalled ? (
                        <motion.div
                            key={lastCalled.id}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: 1,
                                scale: isNewCall ? [1, 1.05, 1] : 1
                            }}
                            transition={{ duration: 0.5 }}
                            style={{ textAlign: 'center' }}
                        >
                            <p style={{
                                fontSize: '3vw',
                                fontWeight: 600,
                                color: 'var(--text-light)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5rem',
                                marginBottom: '2rem'
                            }}>
                                C'est votre tour
                            </p>

                            <div style={{
                                background: 'var(--text)',
                                color: '#fff',
                                padding: '3vw 6vw',
                                borderRadius: '40px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                border: '8px solid var(--secondary)',
                                display: 'inline-block'
                            }}>
                                <span style={{
                                    fontSize: '15vw',
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    {lastCalled.ticket_number || lastCalled.ticketNumber || `#${lastCalled.id}`}
                                </span>
                            </div>

                            {isNewCall && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
                                >
                                    <Bell size={40} color="var(--secondary)" className="floating" />
                                    <span style={{ fontSize: '2vw', fontWeight: 700, color: 'var(--primary)' }}>
                                        Veuillez avancer au comptoir
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h1 style={{ fontSize: '4vw', color: '#ccc' }}>En attente...</h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ fontSize: '2vw', color: 'var(--primary)', opacity: 0.3 }}>MARCHÉ MO</h2>
                </div>
            </div>

            {/* DROITE : LISTE D'ATTENTE */}
            <div style={{
                background: '#f0f2f5',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #eee'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid rgba(0,0,0,0.05)'
                }}>
                    <Users size={32} color="var(--text-light)" />
                    <h2 style={{ margin: 0, fontSize: '2vw', color: 'var(--text)' }}>À SUIVRE</h2>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem' }}>
                    <AnimatePresence>
                        {waitingList.length > 0 ? (
                            waitingList.slice(0, 8).map((client, index) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        background: '#fff',
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <span style={{ fontSize: '2.5vw', fontWeight: 700, color: 'var(--primary)' }}>
                                        {client.ticket_number || `#${client.id}`}
                                    </span>
                                    <span style={{
                                        background: '#eee',
                                        color: '#666',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '1.2vw',
                                        fontWeight: 600
                                    }}>
                                        {index + 1}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#999', fontSize: '1.5vw', marginTop: '4rem' }}>
                                Aucun autre client en attente
                            </p>
                        )}
                    </AnimatePresence>
                </div>

                {waitingList.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '1.2vw' }}>
                        Et {waitingList.length - 8} autres...
                    </div>
                )}
            </div>
        </div>
    );
}
