import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { registerPatient, WebhookError } from '../services/n8nService';
import './Patients.css';

export default function NewPatient() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', dob: '', gender: '', cpf: '', phone: '', email: '',
        bloodType: '', allergies: '', chronic: '', notes: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const result = await registerPatient(form);
            console.log('[NewPatient] n8n webhook response:', result);
            setStatus('success');

            // Navigate after brief success feedback
            setTimeout(() => navigate('/patients'), 1500);
        } catch (error) {
            console.error('[NewPatient] Webhook failed:', error);
            setErrorMsg(
                error instanceof WebhookError
                    ? `Falha ao sincronizar com n8n após ${error.retries + 1} tentativas. Os dados foram salvos localmente.`
                    : 'Erro inesperado ao registrar paciente.',
            );
            setStatus('error');
        }
    }

    function handleDismissError() {
        setStatus('idle');
        setErrorMsg('');
    }

    const isSubmitting = status === 'loading';

    return (
        <div className="animate-fade">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/patients')}>
                <ArrowLeft size={16} /> Voltar
            </button>

            <div className="page-header">
                <h1>Novo Paciente</h1>
                <p>Preencha os dados cadastrais do paciente</p>
            </div>

            {/* Success toast */}
            {status === 'success' && (
                <div className="card" style={{ background: 'var(--success-bg, #ecfdf5)', border: '1px solid var(--success, #10b981)', padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 600, color: '#065f46' }}>Paciente cadastrado e sincronizado com n8n!</span>
                </div>
            )}

            {/* Error toast */}
            {status === 'error' && (
                <div className="card" style={{ background: '#fef2f2', border: '1px solid #ef4444', padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12 }}>
                    <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                    <span style={{ flex: 1, color: '#991b1b', fontSize: 13 }}>{errorMsg}</span>
                    <button className="btn btn-ghost btn-sm" onClick={handleDismissError} style={{ flexShrink: 0 }}>Fechar</button>
                </div>
            )}

            <form className="new-patient-form" onSubmit={handleSubmit}>
                {/* Personal */}
                <div className="card">
                    <p className="form-section-title">Dados pessoais</p>
                    <div className="form-grid">
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="input-label">Nome completo *</label>
                            <input id="name" name="name" className="input-field" required value={form.name} onChange={handleChange} placeholder="João da Silva" disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Data de nascimento *</label>
                            <input id="dob" name="dob" type="date" className="input-field" required value={form.dob} onChange={handleChange} disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Sexo *</label>
                            <select id="gender" name="gender" className="input-field" required value={form.gender} onChange={handleChange} disabled={isSubmitting}>
                                <option value="">Selecione</option>
                                <option value="F">Feminino</option>
                                <option value="M">Masculino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">CPF</label>
                            <input id="cpf" name="cpf" className="input-field" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tipo sanguíneo</label>
                            <select id="blood-type" name="bloodType" className="input-field" value={form.bloodType} onChange={handleChange} disabled={isSubmitting}>
                                <option value="">Selecione</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="card">
                    <p className="form-section-title">Contato</p>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Celular / WhatsApp *</label>
                            <input id="phone" name="phone" className="input-field" required value={form.phone} onChange={handleChange} placeholder="+55 11 99999-9999" disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-mail</label>
                            <input id="email" name="email" type="email" className="input-field" value={form.email} onChange={handleChange} placeholder="paciente@email.com" disabled={isSubmitting} />
                        </div>
                    </div>
                </div>

                {/* Clinical */}
                <div className="card">
                    <p className="form-section-title">Histórico clínico</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="input-group">
                            <label className="input-label">Alergias (separar por vírgula)</label>
                            <input id="allergies" name="allergies" className="input-field" value={form.allergies} onChange={handleChange} placeholder="Dipirona, Penicilina..." disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Comorbidades (separar por vírgula)</label>
                            <input id="chronic" name="chronic" className="input-field" value={form.chronic} onChange={handleChange} placeholder="Hipertensão, Diabetes tipo 2..." disabled={isSubmitting} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Observações iniciais</label>
                            <textarea id="notes" name="notes" className="input-field" rows={4} value={form.notes} onChange={handleChange} placeholder="Histórico familiar, informações relevantes..." style={{ resize: 'vertical' }} disabled={isSubmitting} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/patients')} disabled={isSubmitting}>Cancelar</button>
                    <button id="save-patient-btn" type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ minWidth: 180 }}>
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="spin-icon" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Cadastrar paciente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
