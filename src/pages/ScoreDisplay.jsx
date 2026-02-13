import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Bell, List, Users } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import notificationSound from '../assets/son.mp3';
import carteHandicap from '../assets/carteandicaper.png';

// VARIABLE GLOBALE (Hors React) : L'arme ultime anti-répétition
let globalLastPlayTime = 0;

export default function ScoreDisplay() {
    const [lastCalled, setLastCalled] = useState(null);
    const [lastCalledHistory, setLastCalledHistory] = useState([]);
    const [waitingList, setWaitingList] = useState([]);
    const [isNewCall, setIsNewCall] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);

    // Ref seulement pour l'objet Audio
    const audioRef = useRef(null);

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

    // Fonction pour jouer le son AVEC ANTI-REBOND GLOBAL
    const playNotificationSound = () => {
        const now = Date.now();
        // Si le son a été joué il y a moins de 3 secondes, on ignore !
        if (now - globalLastPlayTime < 3000) {
            console.log("Audio ignoré (anti-rebond activé)");
            return;
        }

        if (audioRef.current) {
            globalLastPlayTime = now; // On note l'heure globale
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
            // On s'assure coté front aussi au cas où
            const todayStr = new Date().toDateString();
            const called = histRes.data.filter(q =>
                q.status === 'called' &&
                new Date(q.created_at || q.timestamp).toDateString() === todayStr
            );

            if (called.length > 0) {
                // Trier pour avoir le plus récent
                called.sort((a, b) => {
                    const dateA = a.called_at || a.calledAt || a.timestamp;
                    const dateB = b.called_at || b.calledAt || b.timestamp;
                    return new Date(dateA) - new Date(dateB);
                });
                const latest = called[called.length - 1];
                const history = called.slice(Math.max(0, called.length - 4), called.length - 1).reverse();

                setLastCalledHistory(history);

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

        socket.on('queue_updated', refreshData);

        // RECHARGEMENT FORCE
        socket.on('reload_page', () => {
            console.log("♻️ RELOAD RECEIVED");
            window.location.reload();
        });

        // Ecouter la demande de replay venant de l'admin
        socket.on('play_sound', () => {
            console.log("🔊 Replay sound requested");
            playNotificationSound();
        });

        // AUTO-CLICK simule (Tentative d'activation son auto pour TV)
        setTimeout(() => {
            if (document.getElementById('start-overlay')) {
                document.getElementById('start-overlay').click();
            }
        }, 2000);

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
            background: '#fafafa',
            overflow: 'hidden',
            position: 'relative' // Important pour l'overlay
        }}>
            {/* OVERLAY INITIAL POUR ACTIVER LE SON */}
            {!soundEnabled && (
                <div
                    id="start-overlay"
                    onClick={enableSound}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.85)',
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
                    <h1 style={{ fontSize: '3rem', marginTop: '2rem' }}>Cliquer pour démarrer l'écran 👆</h1>
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
                                fontSize: '4vw',
                                fontWeight: 700,
                                color: 'var(--text-light)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2rem',
                                marginBottom: '1rem'
                            }}>
                                C'est votre tour 👋
                            </p>

                            <div style={{
                                background: '#B43532',
                                color: '#fff',
                                padding: '3vw 6vw',
                                borderRadius: '40px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'inline-block'
                            }}>
                                <span style={{
                                    fontSize: '18vw',
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
                                </motion.div>
                            )}

                            {/* HISTORIQUE DES 4 DERNIERS APPELS */}
                            {lastCalledHistory.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        marginTop: '4vh',
                                        display: 'flex',
                                        gap: '2vw',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    {lastCalledHistory.map((h) => (
                                        <div key={h.id} style={{
                                            background: '#B43532',
                                            padding: '1.5vw 3vw',
                                            borderRadius: '20px',
                                            opacity: 0.8,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                        }}>
                                            <span style={{ fontSize: '4vw', fontWeight: 800, color: '#fff' }}>
                                                {h.ticket_number || h.ticketNumber || `#${h.id}`}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h1 style={{ fontSize: '6vw', color: '#e5e5e5' }}>En attente... 🕖</h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Logo */}
                <div style={{ marginTop: 'auto', paddingTop: '2rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <img src={carteHandicap} alt="Carte Prioritaire" style={{ height: '10vh', marginBottom: '1vh', opacity: 0.9 }} />
                    <a href="https://microdidact.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text-light)', fontSize: '0.6vw', opacity: 0.5 }}>
                        Réalisé par <strong>microdidact</strong>
                    </a>
                </div>
            </div>

            {/* DROITE : LISTE Dff'ATTENTE */}
            <div style={{
                background: '#fafafa',
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
                    <Users size={32} color="var(--text)" />
                    <h2 style={{ margin: 0, fontSize: '4vw', color: 'var(--text)' }}>À SUIVRE 📋</h2>
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
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <span style={{ fontSize: '5vw', fontWeight: 800, color: 'var(--primary)' }}>
                                        {client.ticket_number || client.ticketNumber || `#${client.id}`}
                                    </span>
                                    <span style={{
                                        background: '#f4f4f5',
                                        color: '#52525b',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '12px',
                                        fontSize: '2vw',
                                        fontWeight: 700
                                    }}>
                                        {index + 1}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '2.5vw', marginTop: '4rem' }}>
                                Personne en attente
                            </p>
                        )}
                    </AnimatePresence>
                </div>

                {waitingList.length > 8 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#71717a', fontSize: '2vw' }}>
                        Et {waitingList.length - 8} autres...
                    </div>
                )}
            </div>
        </div>
    );
}
