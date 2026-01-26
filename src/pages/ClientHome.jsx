import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Globe } from 'lucide-react';

export default function ClientHome() {
    const [phone, setPhone] = useState('+33');
    const { joinQueue } = useQueue();
    const { t, setLanguage, language, isRTL } = useLanguage();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        const isArabic = language === 'ar';

        // Basic phone formatting logic
        if (!isArabic && !value.startsWith('+33')) {
            // Keep +33 for non-arabic if user prefers (though general logic can be improved)
            // For simplicity let's stick to the existing logic but respect user input more if they clear it
            if (value.length < 3) value = '+33'; // Prevent deleting prefix easily
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { code: 'fr', flag: '🇫🇷', label: 'Français' },
                    { code: 'en', flag: '🇬🇧', label: 'English' },
                    { code: 'ar', flag: '🇸🇦', label: 'العربية' }
                ].map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        style={{
                            fontSize: '2rem',
                            background: language === lang.code ? 'white' : 'rgba(255,255,255,0.4)',
                            border: language === lang.code ? '2px solid var(--primary)' : '1px solid transparent',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            padding: '0.8rem',
                            transition: 'all 0.2s',
                            width: '80px',
                            height: '80px',
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
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('home', 'title')}</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{t('home', 'subtitle')}</p>
                </div>

                <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: isRTL ? 'right' : 'left' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        {t('home', 'instruction_title')}
                    </h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5' }}>
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
                                [isRTL ? 'right' : 'left']: '16px',
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
                                    paddingLeft: isRTL ? '1.5rem' : '3.2rem',
                                    paddingRight: isRTL ? '3.2rem' : '1.5rem',
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: 'ltr' // Phones are always LTR
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
