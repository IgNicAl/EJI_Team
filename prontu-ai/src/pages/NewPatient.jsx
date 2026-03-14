import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import './Patients.css';

export default function NewPatient() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', dob: '', gender: '', cpf: '', phone: '', email: '',
        bloodType: '', allergies: '', chronic: '', notes: '',
    });

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        navigate('/patients');
    }

    return (
        <div className="animate-fade">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/patients')}>
                <ArrowLeft size={16} /> Voltar
            </button>

            <div className="page-header">
                <h1>Novo Paciente</h1>
                <p>Preencha os dados cadastrais do paciente</p>
            </div>

            <form className="new-patient-form" onSubmit={handleSubmit}>
                {/* Personal */}
                <div className="card">
                    <p className="form-section-title">Dados pessoais</p>
                    <div className="form-grid">
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="input-label">Nome completo *</label>
                            <input id="name" name="name" className="input-field" required value={form.name} onChange={handleChange} placeholder="João da Silva" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Data de nascimento *</label>
                            <input id="dob" name="dob" type="date" className="input-field" required value={form.dob} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Sexo *</label>
                            <select id="gender" name="gender" className="input-field" required value={form.gender} onChange={handleChange}>
                                <option value="">Selecione</option>
                                <option value="F">Feminino</option>
                                <option value="M">Masculino</option>
                                <option value="O">Outro</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">CPF</label>
                            <input id="cpf" name="cpf" className="input-field" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tipo sanguíneo</label>
                            <select id="blood-type" name="bloodType" className="input-field" value={form.bloodType} onChange={handleChange}>
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
                            <input id="phone" name="phone" className="input-field" required value={form.phone} onChange={handleChange} placeholder="+55 11 99999-9999" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">E-mail</label>
                            <input id="email" name="email" type="email" className="input-field" value={form.email} onChange={handleChange} placeholder="paciente@email.com" />
                        </div>
                    </div>
                </div>

                {/* Clinical */}
                <div className="card">
                    <p className="form-section-title">Histórico clínico</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="input-group">
                            <label className="input-label">Alergias (separar por vírgula)</label>
                            <input id="allergies" name="allergies" className="input-field" value={form.allergies} onChange={handleChange} placeholder="Dipirona, Penicilina..." />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Comorbidades (separar por vírgula)</label>
                            <input id="chronic" name="chronic" className="input-field" value={form.chronic} onChange={handleChange} placeholder="Hipertensão, Diabetes tipo 2..." />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Observações iniciais</label>
                            <textarea id="notes" name="notes" className="input-field" rows={4} value={form.notes} onChange={handleChange} placeholder="Histórico familiar, informações relevantes..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/patients')}>Cancelar</button>
                    <button id="save-patient-btn" type="submit" className="btn btn-primary">
                        <UserPlus size={16} />
                        Cadastrar paciente
                    </button>
                </div>
            </form>
        </div>
    );
}
