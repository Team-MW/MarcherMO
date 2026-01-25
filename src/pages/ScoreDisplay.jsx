import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export default function ScoreDisplay() {
    const { queue } = useQueue();
    const [lastCalled, setLastCalled] = useState(null);
    const [isNewCall, setIsNewCall] = useState(false);

    useEffect(() => {
        const called = queue.filter(q => q.status === 'called');
        if (called.length > 0) {
            const latest = called[called.length - 1]; // Dans le context, ils sont ajoutés à la fin
            if (lastCalled?.id !== latest.id) {
                setLastCalled(latest);
                setIsNewCall(true);
                // Jouer un petit son si vous voulez, ou juste l'animation
                const timer = setTimeout(() => setIsNewCall(false), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [queue, lastCalled]);

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
                                {lastCalled.ticketNumber}
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
