import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, MessageSquare,
    Settings, LogOut, Activity, ChevronRight, Zap
} from 'lucide-react';
import { currentDoctor } from '../data/mock';
import './Sidebar.css';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Pacientes' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', badge: 2 },
    { to: '/settings', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
    const navigate = useNavigate();

    function handleLogout() {
        navigate('/');
    }

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Activity size={18} strokeWidth={2.5} />
                </div>
                <div className="logo-text">
                    <span className="logo-name">Prontu</span>
                    <span className="logo-ai">.ai</span>
                </div>
                <div className="logo-badge">
                    <Zap size={10} />
                    IA
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <p className="sidebar-section-label">Principal</p>
                {navItems.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{label}</span>
                        {badge && <span className="sidebar-badge">{badge}</span>}
                        <ChevronRight size={14} className="sidebar-chevron" />
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="avatar avatar-sm" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                        {currentDoctor.avatar}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{currentDoctor.name}</p>
                        <p className="sidebar-user-role">{currentDoctor.specialty}</p>
                    </div>
                </div>
                <button className="btn btn-ghost btn-icon sidebar-logout" onClick={handleLogout} title="Sair">
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
