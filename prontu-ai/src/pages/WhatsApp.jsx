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
            <div className="page-header">
                <h1>WhatsApp</h1>
                <p>Canal de integração para prontuários via áudio</p>
            </div>

            {/* Connection status */}
            <div className="wa-connection-bar">
                <div className="wa-status-indicator">
                    <div className="wa-dot-lg" />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>Canal conectado</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>+55 11 99999-0001 · Prontu.ai Bot ativo</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    {[
                        { label: 'Áudios processados', value: '34', color: 'var(--primary)' },
                        { label: 'Prontuários gerados', value: '34', color: 'var(--purple)' },
                        { label: 'Não lidas', value: '2', color: 'var(--warning)' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                    ))}
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
                        {/* How it works banner */}
                        <div className="wa-how-banner">
                            <Mic size={18} style={{ color: 'var(--whatsapp)' }} />
                            <p>O médico envia o <strong>áudio da consulta</strong> pelo WhatsApp. A IA transcreve e gera o prontuário automaticamente.</p>
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
                                        <span className="badge badge-primary" style={{ fontSize: 10 }}>Processando...</span>
                                    </div>
                                )}
                                {m.from === 'bot' && (
                                    <div className="wa-bubble bot">
                                        <div className="wa-bubble-sender">
                                            <Zap size={11} style={{ color: 'var(--purple)' }} /> Prontu.ai IA
                                        </div>
                                        <p style={{ whiteSpace: 'pre-line' }}>{m.content}</p>
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
                        { icon: Mic, color: '#25D366', label: '1. Paciente ou médico envia áudio', desc: 'Via WhatsApp, após a consulta' },
                        { icon: Zap, color: 'var(--purple)', label: '2. IA transcreve e estrutura', desc: 'GPT processa em segundos' },
                        { icon: CheckCircle, color: 'var(--accent)', label: '3. Prontuário gerado', desc: 'Disponível na plataforma web' },
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
