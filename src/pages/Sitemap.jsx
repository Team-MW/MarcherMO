import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    QrCode,
    Smartphone,
    UserCircle,
    LayoutDashboard,
    BarChart3,
    Navigation
} from 'lucide-react';

const views = [
    {
        title: "Borne QR Code",
        desc: "Affichage à l'entrée pour le scan client",
        path: "/qr",
        icon: <QrCode size={32} />,
        color: "#0a0a0a"
    },
    {
        title: "Accueil Client",
        desc: "Interface mobile de saisie du numéro",
        path: "/",
        icon: <Smartphone size={32} />,
        color: "#0a0a0a"
    },
    {
        title: "Ticket Client",
        desc: "Suivi de la file en temps réel",
        path: "/status",
        icon: <UserCircle size={32} />,
        color: "#0a0a0a"
    },
    {
        title: "Tableau Boucher",
        desc: "Gestion de la file d'attente",
        path: "/admin",
        icon: <LayoutDashboard size={32} />,
        color: "#8B0000"
    },
    {
        title: "Analyses & Stats",
        desc: "Données et export Excel",
        path: "/analytics",
        icon: <BarChart3 size={32} />,
        color: "#D4AF37"
    },
    {
        title: "Score Boutique",
        desc: "Affichage géant du numéro appelé",
        path: "/score",
        icon: <Navigation size={32} />,
        color: "#16a34a"
    }
];

export default function Sitemap() {
    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'var(--text)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white'
                    }}
                >
                    <Navigation size={40} />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3rem', marginBottom: '1rem' }}
                >
                    Sitemap
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}
                >
                    Accédez à toutes les interfaces du système Marché MO
                </motion.p>
            </header>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {views.map((view, index) => (
                    <motion.div
                        key={view.path}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={view.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="glass-card" style={{
                                height: '100%',
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: '1px solid #f0f0f0',
                                cursor: 'pointer'
                            }}>
                                <div style={{
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '1.5rem',
                                    borderRadius: '20px',
                                    marginBottom: '1.5rem',
                                    color: view.color
                                }}>
                                    {view.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{view.title}</h3>
                                <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{view.desc}</p>
                                <div style={{
                                    marginTop: 'auto',
                                    paddingTop: '1.5rem',
                                    color: 'var(--text)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    Ouvrir la vue <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function ArrowRight({ size, className, color }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
