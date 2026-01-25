import { useQueue } from '../context/QueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Play, RotateCcw, Phone, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ButcherAdmin() {
    const { queue, callNext, resetQueue } = useQueue();

    const waitingList = queue.filter(q => q.status === 'waiting');
    const calledList = queue.filter(q => q.status === 'called').reverse();

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        window.location.reload();
    };

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Tableau de Bord Boucher</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/analytics" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        <BarChart3 size={18} /> Statistiques
                    </Link>
                    <button onClick={handleLogout} className="btn" style={{ background: '#eee', color: '#666' }}>
                        Déconnexion
                    </button>
                    <button onClick={resetQueue} className="btn" style={{ background: '#fee2e2', color: '#991b1b' }}>
                        <RotateCcw size={18} /> Réinitialiser
                    </button>
                </div>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Action & Waiting List */}
                <div>
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Prochain Client</h3>
                        <button
                            onClick={callNext}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '2rem', fontSize: '1.5rem' }}
                            disabled={waitingList.length === 0}
                        >
                            <Play size={32} /> Appeler le prochain
                        </button>
                        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
                            {waitingList.length} client(s) en attente
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Liste d'attente
                        </h3>
                        <div style={{ marginTop: '1rem' }}>
                            <AnimatePresence>
                                {waitingList.map((client, index) => (
                                    <motion.div
                                        key={client.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid #eee',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Client #{client.id.slice(-4)}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={12} /> {client.phone}
                                            </div>
                                        </div>
                                        <div className="badge badge-waiting">{index + 1}e</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {waitingList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>Aucun client en attente</p>}
                        </div>
                    </div>
                </div>

                {/* Right: History */}
                <div className="glass-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={20} /> Clients appelés
                    </h3>
                    <div style={{ marginTop: '1rem' }}>
                        <AnimatePresence>
                            {calledList.map((client) => (
                                <motion.div
                                    key={client.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(22, 163, 74, 0.05)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Client #{client.id.slice(-4)}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{client.phone}</div>
                                    </div>
                                    <div className="badge badge-called">Appelé</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {calledList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem' }}>Historique vide</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
