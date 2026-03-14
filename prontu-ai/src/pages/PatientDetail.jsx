import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mic, Zap, Calendar, Phone, Mail,
    AlertTriangle, FileText, Plus, ChevronDown, ChevronUp,
    MessageSquare, Edit2, Download
} from 'lucide-react';
import { patients, prontuarios } from '../data/mock';
import './PatientDetail.css';

function ConsultCard({ c, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const viaColor = c.via === 'whatsapp' ? '#25D366' : 'var(--primary)';
    const viaLabel = c.via === 'whatsapp' ? '📱 WhatsApp' : '🌐 Web';

    return (
        <div className={`consult-card ${open ? 'open' : ''}`}>
            <div className="consult-header" onClick={() => setOpen(v => !v)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div className="consult-date">
                        <span>{new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        <span className="consult-year">{new Date(c.date).getFullYear()}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{c.type}</span>
                            {c.aiGenerated && (
                                <span className="badge badge-purple" style={{ fontSize: 10 }}>
                                    <Zap size={10} /> IA
                                </span>
                            )}
                            <span className="badge badge-muted" style={{ fontSize: 10, color: viaColor }}>{viaLabel}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            CID: {c.cid.join(' · ')}
                        </p>
                    </div>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ color: 'var(--text-muted)' }}>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {open && (
                <div className="consult-body animate-fade">
                    <div className="consult-section">
                        <h4><FileText size={13} /> Diagnóstico</h4>
                        <p>{c.diagnosis}</p>
                    </div>
                    <div className="consult-section">
                        <h4><Mic size={13} /> Transcrição / Anotações</h4>
                        <div className="transcript-box">{c.transcript}</div>
                    </div>
                    {c.medications.length > 0 && (
                        <div className="consult-section">
                            <h4>💊 Medicamentos</h4>
                            <ul className="med-list">
                                {c.medications.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                    )}
                    {c.exams.length > 0 && (
                        <div className="consult-section">
                            <h4>🔬 Exames solicitados</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {c.exams.map(ex => <span key={ex} className="badge badge-primary">{ex}</span>)}
                            </div>
                        </div>
                    )}
                    {c.nextVisit && (
                        <div className="consult-section">
                            <h4><Calendar size={13} /> Próximo retorno</h4>
                            <p>{new Date(c.nextVisit).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const patient = patients.find(p => p.id === id);
    const record = prontuarios[id];

    if (!patient) {
        return (
            <div className="empty-state" style={{ marginTop: 80 }}>
                <FileText size={48} />
                <h3>Paciente não encontrado</h3>
                <button className="btn btn-primary" onClick={() => navigate('/patients')}>Voltar</button>
            </div>
        );
    }

    return (
        <div className="patient-detail animate-fade">
            {/* Back */}
            <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate('/patients')}>
                <ArrowLeft size={16} />
                Voltar para pacientes
            </button>

            {/* Profile card */}
            <div className="card profile-card">
                <div className="profile-left">
                    <div className="avatar avatar-xl" style={{ background: patient.avatarColor + '22', color: patient.avatarColor }}>
                        {patient.avatar}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{patient.name}</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                            {patient.age} anos · {patient.gender === 'F' ? 'Feminino' : 'Masculino'} ·
                            Tipo sanguíneo: <strong style={{ color: 'var(--text-primary)' }}>{patient.bloodType}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            {patient.whatsappSynced && <span className="badge badge-whatsapp"><MessageSquare size={11} /> WhatsApp</span>}
                            <span className={`badge badge-${patient.status === 'active' ? 'accent' : 'muted'}`}>
                                {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="badge badge-muted">{patient.totalConsults} consultas</span>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn btn-outline btn-sm"><Phone size={14} /> Ligar</button>
                    <button className="btn btn-outline btn-sm"><Mail size={14} /> E-mail</button>
                    <button className="btn btn-primary btn-sm"><Plus size={14} /> Nova consulta</button>
                    <button className="btn btn-ghost btn-icon"><Download size={16} /></button>
                </div>
            </div>

            <div className="detail-layout">
                {/* Left: info panels */}
                <div className="detail-sidebar">
                    {/* Contact */}
                    <div className="card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Informações</h3>
                        <div className="info-rows">
                            {[
                                { label: 'CPF', value: patient.cpf },
                                { label: 'Telefone', value: patient.phone },
                                { label: 'E-mail', value: patient.email },
                                { label: 'Data de nasc.', value: new Date(patient.dob).toLocaleDateString('pt-BR') },
                                { label: 'Última visita', value: new Date(patient.lastVisit).toLocaleDateString('pt-BR') },
                            ].map(({ label, value }) => (
                                <div key={label} className="info-row">
                                    <span className="info-label">{label}</span>
                                    <span className="info-val">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                            <AlertTriangle size={14} style={{ color: 'var(--danger)' }} /> Alergias
                        </h3>
                        {patient.allergies.length ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {patient.allergies.map(a => <span key={a} className="badge badge-danger">{a}</span>)}
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma alergia registrada</p>}
                    </div>

                    {/* Chronic */}
                    <div className="card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Comorbidades</h3>
                        {patient.chronic.length ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {patient.chronic.map(c => <span key={c} className="badge badge-warning">{c}</span>)}
                            </div>
                        ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma comorbidade</p>}
                    </div>

                    {/* AI Summary */}
                    {record && (
                        <div className="card ai-summary-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 28, height: 28, background: 'var(--purple-bg)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple)' }}>
                                    <Zap size={14} />
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Resumo IA</h3>
                                <span className="badge badge-purple" style={{ marginLeft: 'auto', fontSize: 10 }}>Atualizado</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{record.aiSummary}</p>
                        </div>
                    )}
                </div>

                {/* Right: timeline */}
                <div className="detail-main">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Histórico de consultas</h2>
                        <button className="btn btn-primary btn-sm">
                            <Mic size={14} /> Enviar áudio para IA
                        </button>
                    </div>

                    {record ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {record.consultations.map((c, i) => (
                                <ConsultCard key={c.id} c={c} defaultOpen={i === 0} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FileText size={40} />
                            <h3>Sem consultas registradas</h3>
                            <p>Envie um áudio pelo WhatsApp ou registre uma consulta manualmente.</p>
                            <button className="btn btn-primary btn-sm"><Plus size={14} /> Adicionar consulta</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
