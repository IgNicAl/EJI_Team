import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, MessageSquare, ChevronRight, Activity, Loader2, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getPatients, getPatientStats } from '../services/patientService';
import useSupabaseQuery from '../hooks/useSupabaseQuery';
import { patients as mockPatients } from '../data/mock';
import './Patients.css';

const statusColor = { active: 'accent', inactive: 'muted' };
const statusLabel = { active: 'Ativo', inactive: 'Inativo' };

export default function Patients() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const supabaseOn = isSupabaseConfigured();

    const { data: dbPatients, loading, error } = useSupabaseQuery(
        () => supabaseOn ? getPatients({ search, status: filter }) : Promise.resolve(null),
        [supabaseOn, search, filter],
    );

    const { data: dbStats } = useSupabaseQuery(
        () => supabaseOn ? getPatientStats() : Promise.resolve(null),
        [supabaseOn],
    );

    // Use DB data or fall back to mock (with client-side filtering)
    const patients = dbPatients || (() => {
        return mockPatients.filter(p => {
            const matchSearch = !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.phone.includes(search) ||
                p.cpf.includes(search);
            const matchFilter = filter === 'all' || p.status === filter ||
                (filter === 'whatsapp' && p.whatsappSynced);
            return matchSearch && matchFilter;
        });
    })();

    const stats = dbStats || {
        total: mockPatients.length,
        active: mockPatients.filter(p => p.status === 'active').length,
        whatsapp: mockPatients.filter(p => p.whatsappSynced).length,
        totalConsults: mockPatients.reduce((a, p) => a + p.totalConsults, 0),
    };

    return (
        <div className="patients-page animate-fade">
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Pacientes</h1>
                        <p>{stats.total} pacientes cadastrados</p>
                    </div>
                    <button className="btn btn-primary" id="new-patient-btn" onClick={() => navigate('/patients/new')}>
                        <Plus size={16} />
                        Novo Paciente
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="patients-filters">
                <div className="input-wrapper" style={{ flex: 1 }}>
                    <Search size={16} className="input-icon" />
                    <input
                        id="patient-search"
                        className="input-field"
                        placeholder="Buscar por nome, CPF ou telefone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'active', label: 'Ativos' },
                        { key: 'whatsapp', label: 'WhatsApp' },
                        { key: 'inactive', label: 'Inativos' },
                    ].map(f => (
                        <button
                            key={f.key}
                            id={`filter-${f.key}`}
                            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            <div className="patients-stats">
                <div className="pstat">
                    <Users size={16} style={{ color: 'var(--primary)' }} />
                    <span className="pstat-val">{stats.active}</span>
                    <span className="pstat-label">Ativos</span>
                </div>
                <div className="pstat">
                    <MessageSquare size={16} style={{ color: '#25D366' }} />
                    <span className="pstat-val">{stats.whatsapp}</span>
                    <span className="pstat-label">No WhatsApp</span>
                </div>
                <div className="pstat">
                    <Activity size={16} style={{ color: 'var(--warning)' }} />
                    <span className="pstat-val">{stats.totalConsults}</span>
                    <span className="pstat-label">Consultas totais</span>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#fef2f2', border: '1px solid #fca5a5', marginBottom: 16 }}>
                    <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                    <span style={{ color: '#991b1b', fontSize: 13 }}>Erro ao carregar pacientes: {error}</span>
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                        <Loader2 size={28} className="spin-icon" style={{ color: 'var(--primary)' }} />
                    </div>
                ) : patients.length === 0 ? (
                    <div className="empty-state" style={{ padding: 60 }}>
                        <Users size={40} />
                        <h3>Nenhum paciente encontrado</h3>
                        <p>Tente ajustar os filtros ou cadastre um novo paciente.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Contato</th>
                                <th>Comorbidades</th>
                                <th>Última consulta</th>
                                <th>WhatsApp</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p, i) => (
                                <tr
                                    key={p.id}
                                    id={`patient-row-${p.id}`}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                    onClick={() => navigate(`/patients/${p.id}`)}
                                >
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar avatar-md" style={{ background: p.avatarColor + '20', color: p.avatarColor, flexShrink: 0 }}>
                                                {p.avatar}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{p.name}</p>
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.age} anos · {p.gender === 'F' ? 'Feminino' : 'Masculino'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p style={{ fontSize: 13 }}>{p.phone}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</p>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {(p.chronic || []).length ? (p.chronic || []).map(c => (
                                                <span key={c} className="badge badge-warning" style={{ fontSize: 10 }}>{c}</span>
                                            )) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                        {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                    <td>
                                        {p.whatsappSynced
                                            ? <span className="badge badge-whatsapp">Sincronizado</span>
                                            : <span className="badge badge-muted">Não conectado</span>}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${statusColor[p.status]}`}>{statusLabel[p.status]}</span>
                                    </td>
                                    <td>
                                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
