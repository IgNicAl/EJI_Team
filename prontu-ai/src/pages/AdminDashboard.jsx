import React from 'react';
import {
    Users, Activity, DollarSign, Cpu,
    ArrowUpRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { adminStats, adminSystemLogs } from '../data/mock';
import './AdminDashboard.css';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="card stat-card admin-stat">
        <div className="stat-icon" style={{ backgroundColor: color + '15', color }}>
            <Icon size={20} />
        </div>
        <div className="stat-content">
            <p className="stat-label">{label}</p>
            <h3 className="stat-value">{value}</h3>
            {trend && (
                <p className="stat-trend positive">
                    <ArrowUpRight size={14} /> {trend} este mês
                </p>
            )}
        </div>
    </div>
);

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard animate-fade">
            <div className="page-header">
                <h1>Painel Administrativo</h1>
                <p>Visão geral do sistema Prontu.ai</p>
            </div>

            <div className="stats-grid">
                <StatCard label="Total de Médicos" value={adminStats.totalDoctors} icon={Users} color="#0EA5E9" trend="12%" />
                <StatCard label="Assinaturas Ativas" value={adminStats.activeSubscriptions} icon={CheckCircle2} color="#10B981" />
                <StatCard label="Receita Mensal" value={adminStats.monthlyRevenue} icon={DollarSign} color="#8B5CF6" trend="8%" />
                <StatCard label="Uso de IA" value={adminStats.aiCreditsUsed} icon={Cpu} color="#F59E0B" />
            </div>

            <div className="admin-grid">
                <div className="card system-health">
                    <div className="card-header">
                        <h3>Saúde do Sistema</h3>
                        <span className="badge badge-accent">Operacional</span>
                    </div>
                    <div className="health-metrics">
                        <div className="metric">
                            <span>Uptime Médio</span>
                            <strong>{adminStats.systemHealth}</strong>
                        </div>
                        <div className="metric">
                            <span>Tempo de Resposta IA</span>
                            <strong>1.2s</strong>
                        </div>
                        <div className="metric">
                            <span>Erros de Processamento</span>
                            <strong>0.05%</strong>
                        </div>
                    </div>
                    <div className="health-visual">
                        <div className="health-bar">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className="health-slice" style={{ height: 20 + Math.random() * 20 }} title="Estável" />
                            ))}
                        </div>
                        <p className="health-footer">Status das últimas 24 horas</p>
                    </div>
                </div>

                <div className="card recent-logs">
                    <div className="card-header">
                        <h3>Logs de Atividades</h3>
                    </div>
                    <div className="log-list">
                        {adminSystemLogs.map(log => (
                            <div key={log.id} className="log-item">
                                <div className="log-icon">
                                    <Activity size={14} />
                                </div>
                                <div className="log-info">
                                    <p className="log-action">{log.action}</p>
                                    <p className="log-user">Por: {log.user}</p>
                                </div>
                                <span className="log-time">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
