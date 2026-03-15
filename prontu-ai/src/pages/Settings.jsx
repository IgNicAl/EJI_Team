import React from 'react';
import { Activity, Bell, Shield, Smartphone, User, Key, Zap, Save, CheckCircle } from 'lucide-react';
import { currentDoctor } from '../data/mock';
import './Settings.css';

function Section({ icon: Icon, iconColor, title, children }) {
    return (
        <div className="card settings-section">
            <div className="settings-section-title">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: iconColor + '18', color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} />
                </div>
                <h3>{title}</h3>
            </div>
            {children}
        </div>
    );
}

export default function Settings() {
    return (
        <div className="settings-page animate-fade">
            <div className="page-header">
                <h1>Configurações</h1>
                <p>Perfil, integrações e preferências</p>
            </div>

            <div className="settings-layout">
                {/* Profile */}
                <Section icon={User} iconColor="var(--primary)" title="Perfil do médico">
                    <div className="settings-profile-top">
                        <div className="avatar avatar-xl" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                            {currentDoctor.avatar}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{currentDoctor.name}</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{currentDoctor.specialty} · {currentDoctor.crm}</p>
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>Alterar foto</button>
                        </div>
                    </div>
                    <div className="form-grid" style={{ marginTop: 24 }}>
                        {[
                            { label: 'Nome completo', id: 'profile-name', value: currentDoctor.name, type: 'text' },
                            { label: 'CRM', id: 'profile-crm', value: currentDoctor.crm, type: 'text' },
                            { label: 'Especialidade', id: 'profile-specialty', value: currentDoctor.specialty, type: 'text' },
                            { label: 'E-mail', id: 'profile-email', value: currentDoctor.email, type: 'email' },
                        ].map(f => (
                            <div key={f.id} className="input-group">
                                <label className="input-label">{f.label}</label>
                                <input id={f.id} className="input-field" type={f.type} defaultValue={f.value} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <button className="btn btn-primary btn-sm" id="save-profile-btn">
                            <Save size={14} /> Salvar perfil
                        </button>
                    </div>
                </Section>

                {/* WhatsApp */}
                <Section icon={Smartphone} iconColor="#25D366" title="WhatsApp Corporativo">
                    <div className="wa-settings-status">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="wa-dot-lg" />
                            <div>
                                <p style={{ fontWeight: 600 }}>WhatsApp Ativado</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentDoctor.phone} (Integrado ao Perfil)</p>
                            </div>
                        </div>
                        <span className="badge badge-accent">Configurado</span>
                        <span className="badge badge-accent">Editar Número</span>
                    </div>
                    <div className="settings-toggle-list">
                        {[
                            { label: 'Processamento automático de áudio', desc: 'IA processa áudios das consultas automaticamente', on: true },
                            { label: 'Transcrição em tempo real', desc: 'Exibir texto enquanto o áudio é processado', on: true },
                        ].map(t => (
                            <div key={t.label} className="settings-toggle-row">
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</p>
                                </div>
                                <div className={`toggle ${t.on ? 'on' : ''}`} />
                            </div>
                        ))}
                    </div>
                </Section>

                {/* AI */}
                <Section icon={Zap} iconColor="var(--purple)" title="Inteligência Artificial">
                    <div className="settings-toggle-list">
                        {[
                            { label: 'Resumo automático de consultas', desc: 'IA gera resumo após cada consulta processada', on: true },
                            { label: 'Sugestão de diagnósticos por CID', desc: 'IA sugere códigos CID relevantes', on: true },
                            { label: 'Alerta de interações medicamentosas', desc: 'IA verifica medicamentos potencialmente conflitantes', on: false },
                            { label: 'Lembrete de exames vencidos', desc: 'Notificar quando exames passam de 6 meses', on: true },
                        ].map(t => (
                            <div key={t.label} className="settings-toggle-row">
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</p>
                                </div>
                                <div className={`toggle ${t.on ? 'on' : ''}`} />
                            </div>
                        ))}
                    </div>
                </Section>

                <div className="settings-row-2">
                    {/* Notifications */}
                    <Section icon={Bell} iconColor="var(--warning)" title="Notificações">
                        <div className="settings-toggle-list">
                            {[
                                { label: 'E-mail diário', on: true },
                                { label: 'Agenda do dia', on: true },
                                { label: 'Prontuários pendentes', on: false },
                            ].map(t => (
                                <div key={t.label} className="settings-toggle-row">
                                    <p style={{ fontSize: 14 }}>{t.label}</p>
                                    <div className={`toggle ${t.on ? 'on' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Security */}
                    <Section icon={Shield} iconColor="var(--accent)" title="Segurança">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="input-group">
                                <label className="input-label">Senha atual</label>
                                <input id="current-pass" className="input-field" type="password" placeholder="••••••••" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Nova senha</label>
                                <input id="new-pass" className="input-field" type="password" placeholder="••••••••" />
                            </div>
                            <div className="security-info">
                                <Shield size={13} style={{ color: 'var(--accent)' }} />
                                <span>Dados criptografados e conformes com LGPD</span>
                            </div>
                            <button className="btn btn-outline btn-sm" id="change-pass-btn">
                                <Key size={14} /> Alterar senha
                            </button>
                        </div>
                    </Section>
                </div>

                {/* API */}
                <Section icon={Activity} iconColor="var(--primary)" title="API & Integrações">
                    <div className="api-key-box">
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>Chave de API</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Use para integrar com sistemas externos (HIS, prontuário eletrônico)</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <code className="api-key-display">pra_live_••••••••••••••••••••</code>
                            <button className="btn btn-outline btn-sm" id="copy-api-btn">Copiar</button>
                            <button className="btn btn-danger btn-sm">Regenerar</button>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
