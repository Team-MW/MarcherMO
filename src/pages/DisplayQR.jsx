import { motion } from 'framer-motion';
import qrImage from '../assets/qr.png';
import { QrCode, Smartphone } from 'lucide-react';

export default function DisplayQR() {
    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '3rem', maxWidth: '500px' }}
            >
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Scannez pour rejoindre la file</h1>
                    <p style={{ color: 'var(--text-light)' }}>Boucherie Marché MO</p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
                    marginBottom: '2rem',
                    display: 'inline-block'
                }}>
                    <img
                        src={qrImage}
                        alt="QR Code"
                        style={{ width: '100%', maxWidth: '300px', height: 'auto', display: 'block' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        <Smartphone size={24} />
                        <span>Utilisez votre appareil photo</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        <QrCode size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Le système vous alertera par notification
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
