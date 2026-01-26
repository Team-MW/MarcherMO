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
    const [soundEnabled, setSoundEnabled] = useState(false);

    // Refs pour gérer l'audio et l'anti-rebond
    const audioRef = useRef(null);
    const lastPlayTime = useRef(0); // Timestamp du dernier son joué

    // Initialisation Lazy de l'audio (une seule fois)
    if (!audioRef.current) {
        audioRef.current = new Audio(notificationSound);
    }

    // Activer le son (au premier clic)
    const enableSound = () => {
        audioRef.current.play().then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setSoundEnabled(true);
        }).catch(e => console.error("Impossible d'activer le son:", e));
    };

    // Fonction pour jouer le son AVEC ANTI-REBOND (Debounce)
    const playNotificationSound = () => {
        const now = Date.now();
        // Si le son a été joué il y a moins de 3 secondes, on ignore !
        if (now - lastPlayTime.current < 3000) {
            return;
        }

        if (audioRef.current) {
            lastPlayTime.current = now; // On note l'heure
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {
                console.log("Audio bloqué:", e);
            });
        }
    };

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
                    // Si c'est un nouveau client (ID différent), on déclenche l'animation et le son
                    if (latest && prev?.id !== latest.id) {
                        setIsNewCall(true);
                        playNotificationSound();
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

        // Ecouter la demande de replay venant de l'admin
        socket.on('play_sound', () => {
            console.log("🔊 Replay sound requested");
            playNotificationSound();
        });

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
            gridTemplateColumns: '2fr 1fr',
            background: '#f8f9fa',
            overflow: 'hidden',
            position: 'relative' // Important pour l'overlay
        }}>
            {/* OVERLAY INITIAL POUR ACTIVER LE SON */}
            {!soundEnabled && (
                <div
                    onClick={enableSound}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <Bell size={80} className="floating" />
                    <h1 style={{ fontSize: '3rem', marginTop: '2rem' }}>Cliquer pour démarrer l'écran</h1>
                    <p>(Active le son des notifications)</p>
                </div>
            )}

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

                {/* Footer Logo */}
                <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <h2 style={{ fontSize: '1.5vw', color: 'var(--primary)', opacity: 0.3, margin: 0 }}>MARCHÉ MO</h2>
                    <a href="https://microdidact.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#999', fontSize: '0.8vw', opacity: 0.6 }}>
                        Réalisé par <strong>MICRODIDACT</strong>
                    </a>
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
                                Personne en attente
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
