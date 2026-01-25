import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function ClientStatus() {
    const { queue, currentUser } = useQueue();

    // Find current user's state in the latest queue
    const myQueueInfo = queue.find(q => q.id === currentUser?.id);
    const isCalled = myQueueInfo?.status === 'called';

    // Players ahead of current user
    const positionsAhead = queue.filter(q =>
        q.status === 'waiting' &&
        new Date(q.timestamp) < new Date(myQueueInfo?.timestamp)
    ).length;

    return (
        <div className="container">
            <AnimatePresence mode="wait">
                {!isCalled ? (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="glass-card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                        </div>
                        <h2>Vous êtes dans la file</h2>
                        <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                            Personnes devant vous : <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '2rem' }}>{positionsAhead}</span>
                        </p>
                        <div style={{ padding: '1rem', background: 'rgba(139, 0, 0, 0.05)', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                Gardez cette page ouverte ou surveillez vos messages. Nous vous appellerons bientôt !
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="called"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ textAlign: 'center', borderColor: 'var(--secondary)', borderWidth: '2px' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <Bell size={64} style={{ color: 'var(--secondary)', margin: '0 auto' }} className="animate-bounce" />
                        </div>
                        <h1 style={{ color: 'var(--text)' }}>C'est votre tour !</h1>
                        <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                            Le boucher vous attend au comptoir.
                        </p>
                        <div style={{ marginTop: '2rem' }}>
                            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto' }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
      `}} />
        </div>
    );
}
