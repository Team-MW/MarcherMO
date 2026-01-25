import { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Users, Clock, Download, TrendingUp, Calendar, ArrowLeft, FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Analytics() {
    const { queue } = useQueue();

    // 1. Calcul des statistiques
    const stats = useMemo(() => {
        const total = queue.length;
        const called = queue.filter(q => q.status === 'called');

        // Temps d'attente moyen (en minutes)
        let avgWait = 0;
        if (called.length > 0) {
            const totalWait = called.reduce((acc, q) => {
                const start = new Date(q.timestamp);
                const end = new Date(q.calledAt);
                return acc + (end - start);
            }, 0);
            avgWait = Math.round(totalWait / called.length / 60000);
        }

        // Données pour le graphique par heure
        const hoursData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, clients: 0 }));
        queue.forEach(q => {
            const hour = new Date(q.timestamp).getHours();
            hoursData[hour].clients += 1;
        });

        return { total, calledCount: called.length, avgWait, hoursData };
    }, [queue]);

    // 2. Export Excel
    const exportToExcel = () => {
        const dataToExport = queue.map(q => ({
            ID: q.id,
            Telephone: q.phone,
            Statut: q.status === 'called' ? 'Appelé' : 'En attente',
            Arrivee: new Date(q.timestamp).toLocaleString('fr-FR'),
            Appele_a: q.calledAt ? new Date(q.calledAt).toLocaleString('fr-FR') : '-'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Clients");
        XLSX.writeFile(wb, `marche_mo_clients_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <ArrowLeft size={18} /> Retour Admin
                    </Link>
                    <h1 style={{ margin: 0 }}>Statistiques & Analyses</h1>
                </div>
                <button onClick={exportToExcel} className="btn btn-secondary" style={{ gap: '0.8rem' }}>
                    <FileSpreadsheet size={20} /> Exporter en Excel
                </button>
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
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={24} /> Affluence par Heure
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
