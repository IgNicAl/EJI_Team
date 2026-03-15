import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, MessageSquare,
    Settings, LogOut, Activity, ChevronRight, Zap
} from 'lucide-react';
import { currentDoctor } from '../data/mock';
import './Sidebar.css';

const doctorNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients', icon: Users, label: 'Pacientes' },
    { to: '/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/whatsapp-connect', icon: Zap, label: 'Assistente Zap' },
    { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp Chat', badge: 2 },
    { to: '/settings', icon: Settings, label: 'Configurações' },
];

const adminNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Painel Geral' },
    { to: '/admin/users', icon: Users, label: 'Gestão Médicos' },
    { to: '/admin/settings', icon: Settings, label: 'Sistema' },
    { to: '/dashboard', icon: LogOut, label: 'Sair Admin', secondary: true },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const isAdmin = window.location.pathname.startsWith('/admin');

    const navItems = isAdmin ? adminNavItems : doctorNavItems;
    const user = isAdmin ? { name: 'Admin Principal', role: 'Super Admin', avatar: 'AD' } : currentDoctor;

    function handleLogout() {
        navigate('/');
    }

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon" style={{ backgroundColor: isAdmin ? 'var(--purple)' : 'var(--primary)' }}>
                    <Activity size={18} strokeWidth={2.5} />
                </div>
                <div className="logo-text">
                    <span className="logo-name">Prontu</span>
                    <span className="logo-ai">.ai</span>
                </div>
                <div className="logo-badge" style={{ backgroundColor: isAdmin ? 'var(--purple-light)' : 'var(--primary-light)', color: isAdmin ? 'var(--purple)' : 'var(--primary)' }}>
                    <Zap size={10} />
                    {isAdmin ? 'ADM' : 'IA'}
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <p className="sidebar-section-label">{isAdmin ? 'Gerenciamento' : 'Principal'}</p>
                {navItems.map(({ to, icon: Icon, label, badge, secondary }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}${secondary ? ' secondary' : ''}`}
                    >
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
                    <div className="avatar avatar-sm" style={{ background: isAdmin ? 'var(--purple-light)' : 'var(--primary-light)', color: isAdmin ? 'var(--purple)' : 'var(--primary)' }}>
                        {user.avatar}
                    </div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-user-name">{user.name}</p>
                        <p className="sidebar-user-role">{user.role || user.specialty}</p>
                    </div>
                </div>
                <button className="btn btn-ghost btn-icon sidebar-logout" onClick={handleLogout} title="Sair do Sistema">
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
