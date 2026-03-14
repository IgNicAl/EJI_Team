import React, { useState } from 'react';
import {
    Smartphone, MessageSquare, Zap, Shield,
    RefreshCw, CheckCircle, AlertCircle, Key
} from 'lucide-react';
import './AdminSettings.css';

export default function AdminSettings() {
    const [status, setStatus] = useState('connected');

    const Section = ({ icon: Icon, title, children }) => (
        <div className="card settings-section">
            <div className="section-header">
                <Icon size={20} className="section-icon" />
                <h3>{title}</h3>
            </div>
            <div className="section-content">{children}</div>
        </div>
    );

    return (
        <div className="admin-settings animate-fade">
            <div className="page-header">
                <h1>Configurações do Sistema</h1>
                <p>Gerenciamento global de integrações e parâmetros</p>
            </div>

            <div className="settings-grid">
                {/* WhatsApp Gateway Configuration */}
                <Section icon={Smartphone} title="Integração WhatsApp Gateway">
                    <div className="wa-admin-status">
                        <div className="wa-status-card">
                            <div className={`status-dot ${status}`} />
                            <div>
                                <p style={{ fontWeight: 600 }}>Status do Servidor WhatsApp</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Conectado como: +55 11 99999-0001 (Main Gateway)</p>
                            </div>
                            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                                <RefreshCw size={14} /> Reiniciar canal
                            </button>
                        </div>
                    </div>

                    <div className="settings-form-group">
                        <label>WebHook URL</label>
                        <div className="input-wrapper">
                            <input className="input-field" defaultValue="https://api.prontu.ai/webhooks/whatsapp" readOnly />
                        </div>
                        <p className="field-help">Endpoint para recebimento de áudios e mensagens</p>
                    </div>

                    <div className="settings-toggle-list">
                        <div className="settings-toggle-row">
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>Sempre Conectado para Médicos</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quando ativo, os médicos já recebem a conta configurada</p>
                            </div>
                            <div className="toggle active"></div>
                        </div>
                        <div className="settings-toggle-row">
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>Auto-Resposta (Bot)</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enviar confirmação de recebimento de áudio</p>
                            </div>
                            <div className="toggle active"></div>
                        </div>
                    </div>
                </Section>

                {/* Global AI Configuration */}
                <Section icon={Zap} title="Parâmetros de Inteligência Artificial">
                    <div className="settings-form-group">
                        <label>Modelo de Transcrição</label>
                        <select className="input-field">
                            <option>OpenAI Whisper-1 (Turbo)</option>
                            <option>Deepgram Nova-2</option>
                            <option>AssemblyAI</option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label>LLM para Estruturação Clínca</label>
                        <select className="input-field">
                            <option>GPT-4o (Recomendado)</option>
                            <option>Claude 3.5 Sonnet</option>
                            <option>GPT-3.5 Turbo (Econômico)</option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label>Temperatura da IA</label>
                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" style={{ width: '100%' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                            <span>Mais Preciso</span>
                            <span>Mais Criativo</span>
                        </div>
                    </div>
                </Section>

                {/* System API Keys */}
                <Section icon={Key} title="Chaves de API do Sistema">
                    <div className="api-key-item">
                        <span>OpenAI API Key</span>
                        <code>sk-proj-••••••••••••••••••••</code>
                        <button className="btn btn-ghost btn-sm">Editar</button>
                    </div>
                    <div className="api-key-item">
                        <span>WhatsApp Gateway Auth</span>
                        <code>wa-auth-••••••••••••••••••••</code>
                        <button className="btn btn-ghost btn-sm">Editar</button>
                    </div>
                </Section>

                {/* System Security */}
                <Section icon={Shield} title="Segurança & Auditoria">
                    <div className="settings-toggle-list">
                        <div className="settings-toggle-row">
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>Log Decisões IA</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Armazenar o raciocínio da IA para auditoria clínica</p>
                            </div>
                            <div className="toggle"></div>
                        </div>
                        <div className="settings-toggle-row">
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>LGPD Compliance Logging</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rastrear acesso a dados sensíveis de pacientes</p>
                            </div>
                            <div className="toggle active"></div>
                        </div>
                    </div>
                </Section>
            </div>

            <div className="settings-actions">
                <button className="btn btn-ghost">Descartar Alterações</button>
                <button className="btn btn-primary btn-lg">Salvar Configurações Globais</button>
            </div>
        </div>
    );
}
