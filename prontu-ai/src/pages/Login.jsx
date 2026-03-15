import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, MessageSquare, Zap, Shield, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { signIn, demoLogin, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, pass);
            navigate('/dashboard');
        } catch (err) {
            console.error('[Login] Error:', err);
            setError(err?.message || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    function handleDemo(role) {
        demoLogin(role);
        navigate(role === 'admin' ? '/admin' : '/dashboard');
    }

    return (
        <div className="login-page">
            {/* Animated background orbs */}
            <div className="login-orb login-orb-1" />
            <div className="login-orb login-orb-2" />
            <div className="login-orb login-orb-3" />

            <div className="login-left">
                <div className="login-hero">
                    <div className="login-logo">
                        <div className="logo-icon-lg">
                            <Activity size={28} strokeWidth={2} />
                        </div>
                        <div className="login-brand">
                            <span className="brand-name">Prontu</span>
                            <span className="brand-ai">.ai</span>
                        </div>
                    </div>

                    <h1 className="login-headline">
                        Prontuários gerados<br />
                        <span className="gradient-text">por IA, via WhatsApp.</span>
                    </h1>
                    <p className="login-sub">
                        Envie o áudio da consulta pelo zap. A IA transcreve, estrutura e atualiza o prontuário automaticamente.
                    </p>

                    <div className="login-features">
                        {[
                            { icon: MessageSquare, color: '#25D366', label: 'WhatsApp como canal de acesso' },
                            { icon: Zap, color: '#0EA5E9', label: 'Prontuário gerado por IA em segundos' },
                            { icon: Shield, color: '#10B981', label: 'Dados protegidos e criptografados' },
                        ].map(({ icon: Icon, color, label }) => (
                            <div key={label} className="login-feature">
                                <div className="feature-icon" style={{ background: `${color}18`, color }}>
                                    <Icon size={16} />
                                </div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-card-header">
                        <h2>Entrar na plataforma</h2>
                        <p>Bem-vindo de volta, doutor(a)!</p>
                    </div>

                    {/* Error alert */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', borderRadius: 10,
                            background: '#fef2f2', border: '1px solid #fca5a5',
                            marginBottom: 16, fontSize: 13, color: '#991b1b',
                        }}>
                            <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">E-mail ou CRM</label>
                            <input
                                id="email-input"
                                className="input-field"
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Senha</label>
                            <div className="input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    id="password-input"
                                    className="input-field"
                                    type={showPass ? 'text' : 'password'}
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    onClick={() => setShowPass(v => !v)}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="login-forget">
                            <a href="#" className="forgot-link">Esqueci minha senha</a>
                        </div>

                        <button id="login-btn" type="submit" className="btn btn-primary w-full btn-lg login-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spin-icon" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>ou entre como</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleDemo('doctor')}>
                            <Activity size={16} />
                            Demo Médico
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--purple)', color: 'var(--purple)' }} onClick={() => handleDemo('admin')}>
                            <Shield size={16} />
                            Demo Admin
                        </button>
                    </div>

                    <p className="login-footer">
                        Plataforma exclusiva para médicos credenciados.<br />
                        <a href="#">Solicitar acesso</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
