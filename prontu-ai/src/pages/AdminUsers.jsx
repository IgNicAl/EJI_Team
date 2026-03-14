import React, { useState } from 'react';
import {
    Search, Filter, Plus, UserCheck, UserMinus,
    MoreHorizontal, Mail, Phone, Calendar
} from 'lucide-react';
import { doctorsList } from '../data/mock';
import './AdminUsers.css';

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = doctorsList.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-users animate-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Gestão de Médicos</h1>
                    <p>Controle de acesso e profissionais cadastrados</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} /> Novo Médico
                </button>
            </div>

            <div className="card-filters">
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou especialidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn btn-secondary"><Filter size={18} /> Filtros</button>
                    <button className="btn btn-ghost">Exportar CSV</button>
                </div>
            </div>

            <div className="card table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Médico</th>
                            <th>Especialidade</th>
                            <th>Pacientes</th>
                            <th>Data Cadastro</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className="avatar avatar-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {user.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.specialty}</td>
                                <td>{user.patients}</td>
                                <td>{user.joined}</td>
                                <td>
                                    <span className={`badge badge-${user.status === 'active' ? 'accent' : user.status === 'pending' ? 'warning' : 'danger'}`}>
                                        {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-ghost btn-icon" title="Editar"><UserCheck size={16} /></button>
                                        <button className="btn btn-ghost btn-icon" title="Bloquear"><UserMinus size={16} /></button>
                                        <button className="btn btn-ghost btn-icon"><MoreHorizontal size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
