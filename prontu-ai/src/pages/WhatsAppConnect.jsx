import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AlertTriangle, Settings, MessageCircle, Mic, 
    Search, CheckSquare, ExternalLink, ShieldCheck 
} from 'lucide-react';
import './WhatsAppConnect.css';

export default function WhatsAppConnect() {
    const navigate = useNavigate();

    return (
        <div className="wa-setup-page animate-fade">
            <div className="page-header">
                <div>
                    <h1>Assistente WhatsApp</h1>
                    <p>Configure e acesse seu assistente de IA pessoal</p>
                </div>
            </div>

            <div className="wa-setup-container">
                {/* Bloco 1 — Status do número */}
                <div className="wa-status-alert">
                    <div className="wa-alert-content">
                        <div className="wa-alert-icon">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="wa-alert-text">
                            <h3>Antes de usar o assistente</h3>
                            <p>
                                Para que o assistente reconheça você no WhatsApp, é necessário cadastrar seu número de celular na plataforma. 
                                É simples e rápido, basta informar o número uma única vez na página de configurações da sua conta. 
                                Sem esse cadastro, o assistente não consegue identificar quem está enviando a mensagem e não irá responder.
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/settings')}>
                        <Settings size={16} /> Ir para Configurações
                    </button>
                </div>

                {/* Bloco 2 — Botão de acesso */}
                <div className="wa-access-card card">
                    <div className="wa-access-header">
                        <h2>Seu assistente no WhatsApp</h2>
                        <p>Envie o áudio da consulta ou consulte dados de um paciente diretamente pelo WhatsApp.</p>
                    </div>
                    
                    <div className="wa-access-action">
                        <a 
                            href="https://wa.me/5511999990001" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-whatsapp-lg"
                        >
                            <MessageCircle size={24} /> Abrir no WhatsApp
                        </a>
                        <p className="wa-access-disclaimer">
                            Cadastre seu número nas configurações antes de usar o assistente.
                        </p>
                    </div>

                    <div className="wa-access-footer">
                        <ShieldCheck size={14} />
                        <span>Exclusivo para médicos cadastrados na plataforma.</span>
                    </div>
                </div>

                {/* Bloco 3 — Como usar */}
                <div className="wa-how-it-works">
                    <h2 className="section-title">Como funciona o assistente</h2>
                    
                    <div className="wa-steps-grid">
                        <div className="wa-step-card">
                            <div className="step-icon-wrap icon-mic">
                                <Mic size={24} />
                            </div>
                            <h3>🎙️ Gerar prontuário</h3>
                            <p>
                                Grave ou envie o áudio da consulta no WhatsApp. O assistente transcreve, 
                                estrutura o prontuário e salva automaticamente no perfil do paciente.
                            </p>
                        </div>

                        <div className="wa-step-card">
                            <div className="step-icon-wrap icon-search">
                                <Search size={24} />
                            </div>
                            <h3>🔍 Consultar paciente</h3>
                            <p>
                                Peça os dados de qualquer paciente pelo WhatsApp. O assistente gera um 
                                resumo clínico com as informações mais relevantes em segundos.
                            </p>
                        </div>

                        <div className="wa-step-card">
                            <div className="step-icon-wrap icon-check">
                                <CheckSquare size={24} />
                            </div>
                            <h3>✅ Revisar na plataforma</h3>
                            <p>
                                Após cada consulta, acesse o prontuário aqui na plataforma para revisar, 
                                editar e exportar em PDF se necessário.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
