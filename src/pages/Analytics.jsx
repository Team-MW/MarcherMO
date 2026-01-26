import { useState, useMemo, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, Clock, Download, TrendingUp, Calendar, ArrowLeft, FileSpreadsheet, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Analytics() {
    const { queue } = useQueue();
    const [filterRange, setFilterRange] = useState('all'); // 'today', '7d', '30d', 'all'
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Charger les données d'historique depuis l'API
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Déterminer l'URL de base (Render en prod, localhost en dev)
                const isLocal = window.location.hostname === 'localhost';
                const BASE_URL = isLocal
                    ? 'http://localhost:3001'
                    : 'https://marchermo.onrender.com';

                const response = await axios.get(`${BASE_URL}/api/history?filter=${filterRange}`);
                setHistory(response.data);
            } catch (error) {
                console.error("Erreur chargement historique:", error);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [filterRange]); // Recharger quand le filtre change

    // 2. Calcul des statistiques sur les données chargées (history)
    const stats = useMemo(() => {
        // history contient déjà les données filtrées par le backend
        const total = history.length;
        const called = history.filter(q => q.status === 'called');

        // Temps d'attente moyen (en minutes)
        let avgWait = 0;
        if (called.length > 0) {
            const totalWait = called.reduce((acc, q) => {
                // Supporte les deux formats (mémoire vs SQL)
                const created = q.created_at || q.timestamp;
                const calledTime = q.called_at || q.calledAt;

                if (!created || !calledTime) return acc;

                const start = new Date(created);
                const end = new Date(calledTime);
                return acc + (end - start);
            }, 0);
            avgWait = Math.round(totalWait / called.length / 60000);
        }

        // Données pour le graphique par heure
        const hoursData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, clients: 0 }));
        history.forEach(q => {
            const created = q.created_at || q.timestamp;
            if (created) {
                const hour = new Date(created).getHours();
                if (hoursData[hour]) hoursData[hour].clients += 1;
            }
        });

        return { total, calledCount: called.length, avgWait, hoursData };
    }, [history]);

    // 3. Export Excel (Données chargées)
    const exportToExcel = () => {
        const dataToExport = history.map(q => {
            const created = q.created_at || q.timestamp;
            const calledTime = q.called_at || q.calledAt;

            return {
                ID: q.id,
                Telephone: q.phone,
                Statut: q.status === 'called' ? 'Appelé' : 'En attente',
                Arrivee: created ? new Date(created).toLocaleString('fr-FR') : '-',
                Appele_a: calledTime ? new Date(calledTime).toLocaleString('fr-FR') : '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clients");
        XLSX.writeFile(wb, `marche_mo_stats_${filterRange}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const filterOptions = [
        { id: 'today', label: "Aujourd'hui" },
        { id: '7d', label: "7 derniers jours" },
        { id: '30d', label: "30 derniers jours" },
        { id: 'all', label: "Tout" },
    ];

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>Chargement des statistiques...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} /> Retour Admin
                    </Link>
                    <h1 style={{ margin: 0 }}>Statistiques & Analyses</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Filtres Select Style */}
                    <div style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '16px', display: 'flex', gap: '0.25rem', border: '1px solid #eee' }}>
                        {filterOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setFilterRange(opt.id)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    background: filterRange === opt.id ? 'var(--text)' : 'transparent',
                                    color: filterRange === opt.id ? 'white' : 'var(--text-light)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={exportToExcel} className="btn btn-secondary" style={{ gap: '0.8rem', padding: '0.8rem 1.5rem' }}>
                        <FileSpreadsheet size={20} /> Exporter
                    </button>
                </div>
            </div>

            {/* Cartes Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ margin: 0, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(139, 0, 0, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                            <Users color="var(--primary)" size={32} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-light)', margin: 0 }}>Total Clients</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.total}</h2>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ margin: 0, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                            <Clock color="var(--secondary)" size={32} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-light)', margin: 0 }}>Attente Moyenne</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.avgWait} <span style={{ fontSize: '1rem' }}>min</span></h2>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ margin: 0, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(22, 163, 74, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                            <TrendingUp color="#16a34a" size={32} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-light)', margin: 0 }}>Clients Servis</p>
                            <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats.calledCount}</h2>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Graphiques */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Calendar size={24} />
                        Affluence par Heure
                        <span style={{ fontSize: '0.9rem', fontWeight: 400, background: '#eee', padding: '0.2rem 0.8rem', borderRadius: '20px', color: '#666' }}>
                            {filterOptions.find(o => o.id === filterRange).label}
                        </span>
                    </h3>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.hoursData}>
                                <defs>
                                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clients"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorClients)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
