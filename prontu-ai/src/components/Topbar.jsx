import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Plus, ChevronDown, Sun, Moon } from 'lucide-react';
import { currentDoctor } from '../data/mock';
import { useTheme } from '../context/ThemeContext';
import './Topbar.css';

const pageTitles = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do dia' },
    '/patients': { title: 'Pacientes', subtitle: 'Gerencie seus pacientes' },
    '/agenda': { title: 'Agenda', subtitle: 'Consultas e compromissos' },
    '/whatsapp': { title: 'WhatsApp', subtitle: 'Canal de integração' },
    '/settings': { title: 'Configurações', subtitle: 'Perfil e preferências' },
};

// Format date in Portuguese
function getDateStr() {
    const now = new Date('2026-03-14');
    return now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Topbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const base = '/' + location.pathname.split('/')[1];
    const page = pageTitles[base] || { title: 'Prontu.ai', subtitle: '' };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div>
                    <h2 className="topbar-title">{page.title}</h2>
                    <p className="topbar-sub">{page.subtitle} · <span className="topbar-date">{getDateStr()}</span></p>
                </div>
            </div>

            <div className="topbar-right">
                {/* Search */}
                <div className="topbar-search">
                    <Search size={15} className="search-icon" />
                    <input className="search-input" placeholder="Buscar paciente..." />
                    <kbd className="search-kbd">⌘K</kbd>
                </div>

                {/* Theme Toggle */}
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* New Consultation */}
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/patients/new')}>
                    <Plus size={15} />
                    Nova Consulta
                </button>

                {/* Notifications */}
                <button className="btn btn-ghost btn-icon topbar-notif" id="notifications-btn">
                    <Bell size={18} />
                    <span className="notif-dot" />
                </button>

                {/* User */}
                <div className="topbar-user">
                    <div className="avatar avatar-sm" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                        {currentDoctor.avatar}
                    </div>
                    <span className="topbar-user-name">{currentDoctor.name.split(' ')[0]} {currentDoctor.name.split(' ')[1]}</span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
            </div>
        </header>
    );
}
