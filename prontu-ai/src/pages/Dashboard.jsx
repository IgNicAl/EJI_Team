import React from 'react';
import {
    Users, Calendar, MessageSquare, Zap,
    TrendingUp, ArrowRight, Clock, Activity, Mic, Loader2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { isSupabaseConfigured } from '../lib/supabase';
import {
    getDashboardStats, getWeeklyData, getRecentPatients, getTodayAppointments, getRecentMessages
} from '../services/dashboardService';
import useSupabaseQuery from '../hooks/useSupabaseQuery';
import {
    dashboardStats as mockStats, patients as mockPatients,
    appointments as mockAppointments, whatsappMessages as mockMessages, weeklyData as mockWeekly
} from '../data/mock';
import './Dashboard.css';

function StatCard({ icon: Icon, label, value, trend, color, bg }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={22} strokeWidth={1.8} />
            </div>
            <div className="stat-info">
                <h3 style={{ color }}>{value}</h3>
                <p>{label}</p>
                {trend && <p className="stat-trend trend-up">{trend}</p>}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="stat-card" style={{ opacity: 0.5 }}>
            <div className="stat-icon" style={{ background: 'var(--bg-elevated)' }}>
                <Loader2 size={22} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="stat-info">
                <h3 style={{ color: 'var(--text-muted)' }}>—</h3>
                <p>Carregando...</p>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{payload[0].value} consultas</p>
        </div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const supabaseOn = isSupabaseConfigured();

    // Fetch from Supabase or use mock data
    const { data: dbStats, loading: statsLoading } = useSupabaseQuery(
        () => supabaseOn ? getDashboardStats() : Promise.resolve(null),
        [supabaseOn],
    );
    const { data: dbWeekly, loading: weeklyLoading } = useSupabaseQuery(
        () => supabaseOn ? getWeeklyData() : Promise.resolve(null),
        [supabaseOn],
    );
    const { data: dbPatients, loading: patientsLoading } = useSupabaseQuery(
        () => supabaseOn ? getRecentPatients(4) : Promise.resolve(null),
        [supabaseOn],
    );
    const { data: dbAppts, loading: apptsLoading } = useSupabaseQuery(
        () => supabaseOn ? getTodayAppointments() : Promise.resolve(null),
        [supabaseOn],
    );
    const { data: dbMessages, loading: msgsLoading } = useSupabaseQuery(
        () => supabaseOn ? getRecentMessages(3) : Promise.resolve(null),
        [supabaseOn],
    );

    // Resolve data: DB first, mock fallback
    const currentStats = dbStats || mockStats;
    const weeklyData = dbWeekly || mockWeekly;
    const recentPatients = dbPatients || mockPatients.slice(0, 4);
    const todayAppts = dbAppts || mockAppointments.filter(a => a.date === '2026-03-14');
    const waMessages = dbMessages || mockMessages.slice(0, 3);
    const unreadWA = waMessages.filter(m => !m.read);

    const isLoading = statsLoading || weeklyLoading;

    const stats = [
        { icon: Users, label: 'Total de pacientes', value: currentStats.totalPatients, trend: `+${currentStats.newThisMonth} este mês`, color: 'var(--primary)', bg: 'var(--primary-bg)' },
        { icon: Calendar, label: 'Consultas hoje', value: currentStats.consultationsToday, color: 'var(--accent)', bg: 'var(--accent-bg)' },
        { icon: MessageSquare, label: 'Mensagens WhatsApp', value: currentStats.whatsappMessages, trend: `${unreadWA.length} não lidas`, color: '#25D366', bg: 'rgba(37,211,102,0.1)' },
        { icon: Zap, label: 'Prontuários com IA', value: currentStats.aiGenerated, trend: 'este mês', color: 'var(--purple)', bg: 'var(--purple-bg)' },
    ];

    const statusColor = { confirmed: 'accent', pending: 'warning', cancelled: 'danger' };
    const statusLabel = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' };

    return (
        <div className="dashboard animate-fade">
            {/* Stats */}
            <div className="stats-grid">
                {isLoading
                    ? [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
                    : stats.map(s => <StatCard key={s.label} {...s} />)
                }
            </div>

            <div className="dashboard-main">
                {/* Left column */}
                <div className="dashboard-col">
                    {/* Chart */}
                    <div className="card chart-card">
                        <div className="card-header">
                            <div>
                                <h3>Consultas na semana</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>últimos 7 dias</p>
                            </div>
                            <div className="badge badge-primary">
                                <TrendingUp size={12} />
                                +18%
                            </div>
                        </div>
                        {weeklyLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                                <Loader2 size={24} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={weeklyData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.06)' }} />
                                    <Bar dataKey="consultas" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Patients recent */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Pacientes recentes</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')}>
                                Ver todos <ArrowRight size={13} />
                            </button>
                        </div>
                        {patientsLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                                <Loader2 size={20} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : (
                            <div className="recent-patients">
                                {recentPatients.map((p, i) => (
                                    <div
                                        key={p.id}
                                        className="recent-patient-row"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                        onClick={() => navigate(`/patients/${p.id}`)}
                                    >
                                        <div className="avatar avatar-md" style={{ background: p.avatarColor + '22', color: p.avatarColor }}>
                                            {p.avatar}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.age} anos · {(p.chronic || []).join(', ') || 'Sem comorbidades'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('pt-BR') : '—'}
                                            </p>
                                            {p.whatsappSynced && <span className="badge badge-whatsapp" style={{ fontSize: 10, marginTop: 3 }}>WhatsApp</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="dashboard-col-sm">
                    {/* Agenda today */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Agenda de hoje</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agenda')}>
                                <Calendar size={13} /> Abrir
                            </button>
                        </div>
                        {apptsLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                                <Loader2 size={20} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {todayAppts.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma consulta hoje</p>
                                ) : todayAppts.map((a, i) => (
                                    <div key={a.id} className="agenda-item" style={{ animationDelay: `${i * 60}ms` }}>
                                        <div className="agenda-time">
                                            <Clock size={12} />
                                            {a.time}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 13 }}>{a.patientName}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.type} · {a.duration}min</p>
                                        </div>
                                        <span className={`badge badge-${statusColor[a.status]}`} style={{ flexShrink: 0 }}>
                                            {statusLabel[a.status]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* WhatsApp activity */}
                    <div className="card whatsapp-card">
                        <div className="card-header">
                            <h3>WhatsApp</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/whatsapp')}>
                                <ArrowRight size={13} />
                            </button>
                        </div>
                        <div className="wa-status-row">
                            <div className="wa-dot" />
                            <span style={{ fontSize: 13, color: 'var(--accent)' }}>Canal conectado</span>
                        </div>
                        {msgsLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                <Loader2 size={16} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                                {waMessages.map(m => (
                                    <div key={m.id} className={`wa-msg-row ${!m.read ? 'unread' : ''}`}>
                                        <Mic size={14} style={{ color: 'var(--whatsapp)', flexShrink: 0, marginTop: 2 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: !m.read ? 600 : 400 }}>{m.patientName || 'Sistema'}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{m.content}</p>
                                        </div>
                                        <span style={{ fontSize: 10, color: 'var(--text-disabled)', flexShrink: 0 }}>{m.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-outline w-full btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/whatsapp')}>
                            <Activity size={13} />
                            Ver todas as mensagens
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
