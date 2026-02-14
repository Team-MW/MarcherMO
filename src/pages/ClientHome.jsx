import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
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
            // Correction automatique : Si l'utilisateur tape +330..., on enlève le 0
            if (value.startsWith('+330')) {
                value = '+33' + value.substring(4);
            }

            // On force +33 sauf si l'utilisateur commence par 0 (format local)
            if (!value.startsWith('+33') && !value.startsWith('0')) {
                if (value.length < 3) value = '+33';
            }
        }

        // Limites strictes
        if (value.startsWith('0')) {
            // Format local fr (ex: 0612345678) -> 10 chiffres
            if (value.length > 10) return;
        } else if (value.startsWith('+33')) {
            // Format international correct (ex: +33612345678) -> 12 chars
            if (value.length > 12) return;
        } else if (value.length > 15) {
            return;
        }

        setPhone(value);
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
        </div>
    );
}
