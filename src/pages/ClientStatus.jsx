import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Loader2, Star, MapPin, ExternalLink, MessageSquareHeart } from 'lucide-react';

export default function ClientStatus() {
    const { queue, currentUser } = useQueue();
    const { t, isRTL } = useLanguage();

    const myQueueInfo = queue.find(q => q.id === currentUser?.id);
    const isCalled = myQueueInfo?.status === 'called';

    const positionsAhead = queue.filter(q =>
        q.status === 'waiting' &&
        new Date(q.timestamp) < new Date(myQueueInfo?.timestamp)
    ).length;

    const googleReviewLink = "https://www.google.com/search?q=March%C3%A9+de+Mo%27+Toulouse+avis#lrd=0x12aebb77beecd58b:0x393c66f772e0474b,1,,,";

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                {!isCalled ? (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card"
                        style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                    >
                        {/* Background Accent */}
                        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(0,0,0,0.03)', borderRadius: '50%' }} />

                        <div style={{ marginBottom: '2.5rem' }}>
                            <div className="floating">
                                <Loader2 size={60} style={{ color: 'var(--text)', margin: '0 auto' }} className="animate-spin-slow" />
                            </div>
                        </div>

                        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{t('status', 'title_waiting')}</h1>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                            {t('status', 'subtitle_waiting')}
                        </p>

                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '2rem',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.03)',
                            marginBottom: '2rem',
                            border: '1px solid #f0f0f0'
                        }}>

                            <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                                {positionsAhead === 0 ? t('status', 'ticket_label') : t('status', 'position_label')}
                            </p>
                            <motion.span
                                key={positionsAhead}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--text)', display: 'block', lineHeight: 1 }}
                            >
                                {positionsAhead === 0 ? myQueueInfo?.ticket_number : positionsAhead}
                            </motion.span>
                            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                                {positionsAhead > 0 ? `${positionsAhead} ${t('status', 'persons_ahead')}` : t('status', 'next_label')}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                <div className="pulse-dot" />
                                {t('status', 'realtime_label')}
                            </div>

                            <div style={{
                                background: '#fafafa',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid #eee',
                                maxWidth: '500px',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: 0, color: 'var(--text)', fontSize: '1rem', fontWeight: 600 }}>
                                    {t('status', 'sms_info_title')}
                                </p>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                    {t('status', 'sms_info_desc')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="called"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{
                            textAlign: 'center',
                            borderColor: 'var(--primary)',
                            borderWidth: '2px',
                            background: 'white'
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <Bell size={80} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                        </motion.div>

                        <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem', color: 'var(--text)' }}>{t('status', 'title_called')}</h1>
                        <p style={{ fontSize: '1.3rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
                            {t('status', 'subtitle_called')}
                        </p>

                        <div style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}>
                            <CheckCircle2 size={24} />
                            <span style={{ fontWeight: 600 }}>{t('status', 'called_confirmation')}</span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '2.5rem' }} />

                        {/* Google Review Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Star size={20} fill="var(--primary)" color="var(--primary)" />
                                {t('status', 'review_title')}
                                <Star size={20} fill="var(--primary)" color="var(--primary)" />
                            </p>

                            <a
                                href={googleReviewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ width: '100%', textDecoration: 'none', background: '#fff', border: '1px solid #eee', gap: '12px', padding: '1.2rem', flexDirection: isRTL ? 'row-reverse' : 'row' }}
                            >
                                <MessageSquareHeart size={20} color="var(--primary)" />
                                {t('status', 'review_btn')}
                                <ExternalLink size={16} color="#999" />
                            </a>

                            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#999', fontSize: '0.85rem', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <MapPin size={14} />
                                {t('status', 'location')}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
      `}} />
        </div>
    );
}
