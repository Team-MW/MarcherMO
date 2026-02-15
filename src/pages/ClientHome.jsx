import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Globe } from 'lucide-react';
import carteHandicap from '../assets/carteandicaper.png';

export default function ClientHome() {
    const [phone, setPhone] = useState('+33');
    const { joinQueue } = useQueue();
    const { t, setLanguage, language, isRTL } = useLanguage();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Supprimer les espaces
        value = value.replace(/\s/g, '');

        const isArabic = language === 'ar';

        // Logique de formatage améliorée
        if (!isArabic) {
            // On force +33 sauf si l'utilisateur commence par 0 (format local)
            if (!value.startsWith('+33') && !value.startsWith('0')) {
                if (value.length < 3) value = '+33';
            }
        }

        // Limites strictes adaptatives
        if (value.startsWith('0')) {
            // Format local fr (ex: 0612345678) -> 10 chiffres
            if (value.length > 10) return;
        } else if (value.startsWith('+330')) {
            // Cas autorisé : +3306... (13 chars)
            if (value.length > 13) return;
        } else if (value.startsWith('+33')) {
            // Format international standard : +336... (12 chars)
            if (value.length > 12) return;
        } else if (value.length > 15) {
            return;
        }

        setPhone(value);
    };

    const [showGDPR, setShowGDPR] = useState(false);

    useState(() => {
        const consented = localStorage.getItem('gdpr_consent');
        if (!consented) {
            setShowGDPR(true);
        }
    }, []);

    const handleAcceptGDPR = () => {
        localStorage.setItem('gdpr_consent', 'true');
        setShowGDPR(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (phone.length < 8) return;
        joinQueue(phone);
        navigate('/status');
    };

    return (
        <div className="container">
            {/* Language Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                    { code: 'fr', flag: '🇫🇷', label: 'Français' },
                    { code: 'en', flag: '🇬🇧', label: 'English' },
                    { code: 'ar', flag: '🇸🇦', label: 'العربية' }
                ].map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        style={{
                            fontSize: '1.5rem',
                            background: language === lang.code ? 'white' : 'rgba(255,255,255,0.4)',
                            border: language === lang.code ? '2px solid var(--primary)' : '1px solid transparent',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            transition: 'all 0.2s',
                            width: '45px',
                            height: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: language === lang.code ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            transform: language === lang.code ? 'translateY(-2px)' : 'none'
                        }}
                        title={lang.label}
                    >
                        {lang.flag}
                    </button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '500px', margin: '0 auto' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <img src={carteHandicap} alt="Marché MO" style={{ height: '80px', marginBottom: '0.5rem' }} />
                </div>

                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', textAlign: isRTL ? 'right' : 'left' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        {t('home', 'instruction_title')}
                    </h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                        {t('home', 'instruction_desc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', textAlign: isRTL ? 'right' : 'left' }}>
                            {t('home', 'phone_label')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={20} style={{
                                position: 'absolute',
                                left: '16px', // Force Left
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-light)'
                            }} />
                            <input
                                id="phone"
                                type="tel"
                                placeholder={t('home', 'placeholder')}
                                value={phone}
                                onChange={handlePhoneChange}
                                style={{
                                    paddingLeft: '3.2rem', // Force Left padding for icon
                                    paddingRight: '1.5rem',
                                    textAlign: 'left', // Force Left alignment
                                    direction: 'ltr' // Always LTR for phone numbers
                                }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
                        {t('home', 'submit_btn')}
                        {isRTL ? <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> : <ArrowRight size={20} />}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center', lineHeight: '1.5' }}>
                    {t('home', 'notification_text')}
                </p>
            </motion.div>

            <AnimatePresence>
                {showGDPR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '24px',
                                maxWidth: '90%',
                                width: '400px',
                                textAlign: 'center',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                            }}
                        >
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--primary)' }}>Données Personnelles 🔒</h2>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Vos informations sont utilisées uniquement pour gérer votre place dans la file d'attente. Elles sont automatiquement effacées de notre système à la fin de la journée. Aucune donnée n'est conservée ni utilisée à des fins commerciales.
                            </p>
                            <button
                                onClick={handleAcceptGDPR}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                J'ai compris
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
