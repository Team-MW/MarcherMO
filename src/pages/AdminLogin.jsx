import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    const correctCode = '000000';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code === correctCode) {
            localStorage.setItem('admin_auth', 'true');
            onLogin();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
            setCode('');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
            >
                <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Lock color="white" size={30} />
                </div>
                <h2>Accès Administrateur</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Veuillez entrer le code secret à 6 chiffres</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="••••••"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            style={{
                                textAlign: 'center',
                                fontSize: '2rem',
                                letterSpacing: '0.8rem',
                                borderColor: error ? '#ef4444' : '#ddd',
                                background: error ? '#fef2f2' : 'white'
                            }}
                            autoFocus
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        Se connecter <ArrowRight size={20} />
                    </motion.button>
                </form>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600 }}
                    >
                        Code incorrect, réessayez.
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}
