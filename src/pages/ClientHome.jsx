import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';

export default function ClientHome() {
    const [phone, setPhone] = useState('+33');
    const { joinQueue } = useQueue();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Empêcher la suppression du +33
        if (!value.startsWith('+33')) {
            value = '+33' + value.replace(/^\+?3?3?/, '');
        }
        // Garder seulement les chiffres après le +
        const digits = value.slice(1).replace(/\D/g, '');
        setPhone('+' + digits);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (phone.length < 12) return; // +33 + 9 chiffres minimum
        joinQueue(phone);
        navigate('/status');
    };

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Marché MO</h1>
                    <p style={{ color: 'var(--text-light)' }}>Boucherie Traditionnelle</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="phone">Votre numéro de téléphone</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                            <input
                                id="phone"
                                type="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={phone}
                                onChange={handlePhoneChange}
                                style={{ paddingLeft: '2.8rem' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Rejoindre la file d'attente
                        <ArrowRight size={20} />
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center' }}>
                    Nous vous enverrons une notification quand ce sera votre tour.
                </p>
            </motion.div>
        </div>
    );
}
