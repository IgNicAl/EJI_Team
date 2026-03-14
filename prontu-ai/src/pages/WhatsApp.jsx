import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Mic, Zap, CheckCircle, Clock, XCircle,
    Phone, MoreVertical, Send, Smile, Paperclip, Volume2
} from 'lucide-react';
import { whatsappMessages, patients } from '../data/mock';
import './WhatsApp.css';

const getPatient = (id) => patients.find(p => p.id === id);

export default function WhatsApp() {
    const [activeConv, setActiveConv] = useState('p-001');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const convPatients = [...new Set(whatsappMessages.filter(m => m.patientId).map(m => m.patientId))]
        .map(id => getPatient(id))
        .filter(Boolean);

    const messages = whatsappMessages.filter(
        m => m.patientId === activeConv || m.from === 'bot' || m.from === 'system'
    );

    const activePatient = getPatient(activeConv);

    return (
        <div className="whatsapp-page animate-fade">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>WhatsApp</h1>
                    <p>Canal de integração ativo · +55 11 99999-0001</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="badge badge-accent"><Mic size={12} /> Áudio Ativado</div>
                    <div className="badge badge-whatsapp"><Zap size={12} /> IA Conectada</div>
                </div>
            </div>

            {/* Chat interface */}
            <div className="wa-chat-layout">
                {/* Conversations */}
                <div className="wa-conversations">
                    <div className="wa-conv-header">
                        <h3>Conversas</h3>
                        <span className="badge badge-whatsapp">{convPatients.length}</span>
                    </div>
                    {convPatients.map(p => {
                        const lastMsg = [...whatsappMessages].reverse().find(m => m.patientId === p.id);
                        const unread = whatsappMessages.filter(m => m.patientId === p.id && !m.read).length;
                        return (
                            <div
                                key={p.id}
                                id={`conv-${p.id}`}
                                className={`wa-conv-item ${activeConv === p.id ? 'active' : ''}`}
                                onClick={() => setActiveConv(p.id)}
                            >
                                <div className="avatar avatar-md" style={{ background: p.avatarColor + '22', color: p.avatarColor }}>
                                    {p.avatar}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontWeight: 600, fontSize: 14 }} className="truncate">{p.name}</p>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{lastMsg?.time}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }} className="truncate">{lastMsg?.content}</p>
                                </div>
                                {unread > 0 && <span className="wa-unread-badge">{unread}</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Chat window */}
                <div className="wa-chat">
                    {/* Chat header */}
                    <div className="wa-chat-header">
                        <div
                            className="wa-chat-patient"
                            onClick={() => navigate(`/patients/${activeConv}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="avatar avatar-sm" style={{ background: activePatient?.avatarColor + '22', color: activePatient?.avatarColor }}>
                                {activePatient?.avatar}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 14 }}>{activePatient?.name}</p>
                                <p style={{ fontSize: 11, color: 'var(--accent)' }}>Online · Ver prontuário →</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-icon"><Phone size={16} /></button>
                            <button className="btn btn-ghost btn-icon"><MoreVertical size={16} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="wa-messages">
                        {/* Audio Focus Banner */}
                        <div className="wa-audio-focus-card">
                            <div className="audio-focus-icon">
                                <Mic size={24} />
                            </div>
                            <div className="audio-focus-text">
                                <h3>Gravar Áudio da Consulta</h3>
                                <p>A IA irá transcrever e estruturar o prontuário automaticamente na ficha do paciente.</p>
                            </div>
                            <button className="btn btn-primary pulse-glow">
                                <Mic size={18} /> Iniciar Gravação
                            </button>
                        </div>

                        {messages.map((m, i) => (
                            <div key={m.id} className={`wa-msg-wrap ${m.from === 'patient' ? 'left' : m.from === 'bot' ? 'center' : 'right'}`}
                                style={{ animationDelay: `${i * 60}ms` }}>
                                {m.from === 'patient' && (
                                    <div className="wa-bubble patient">
                                        <div className="wa-bubble-sender">{m.patientName}</div>
                                        <p>{m.content}</p>
                                        <div className="wa-bubble-meta">{m.time} <CheckCircle size={11} /></div>
                                    </div>
                                )}
                                {m.from === 'system' && (
                                    <div className="wa-system-msg">
                                        <Volume2 size={13} style={{ color: 'var(--primary)' }} />
                                        <span>{m.content}</span>
                                        <span className="badge badge-primary" style={{ fontSize: 10 }}>Processando Prontuário...</span>
                                    </div>
                                )}
                                {m.from === 'bot' && (
                                    <div className="wa-bubble bot">
                                        <div className="wa-bubble-sender">
                                            <Zap size={11} style={{ color: 'var(--purple)' }} /> Prontu.ai IA
                                        </div>
                                        <p style={{ whiteSpace: 'pre-line' }}>✨ <strong>Prontuário estruturado com sucesso!</strong>{"\n\n"}{m.content}</p>
                                        <div className="wa-bubble-meta">{m.time} <CheckCircle size={11} style={{ color: 'var(--primary)' }} /></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="wa-input-area">
                        <button className="btn btn-ghost btn-icon"><Smile size={18} /></button>
                        <button className="btn btn-ghost btn-icon"><Paperclip size={18} /></button>
                        <input
                            className="wa-text-input"
                            placeholder="Digite uma mensagem..."
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                        />
                        <button className="btn btn-accent btn-icon">
                            <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* Info panel */}
                <div className="wa-info-panel">
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, padding: '0 0 12px', borderBottom: '1px solid var(--border)' }}>
                        Como funciona
                    </h3>
                    {[
                        { icon: Mic, color: '#25D366', label: '1. Grave a consulta', desc: 'Clique no botão acima ou envie pelo Zap' },
                        { icon: Zap, color: 'var(--purple)', label: '2. IA estrutura os dados', desc: 'Transcrição e CID automáticos' },
                        { icon: CheckCircle, color: 'var(--accent)', label: '3. Prontuário salvo', desc: 'Acesse pela web ou PDF' },
                    ].map(s => (
                        <div key={s.label} className="wa-step">
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                                <s.icon size={15} />
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
