import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, ChevronLeft, ChevronRight, Video, MapPin, Calendar, Loader2 } from 'lucide-react';
import { appointments } from '../data/mock';
import { syncAppointment } from '../services/n8nService';
import './Agenda.css';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const STATUS_COLOR = { confirmed: 'accent', pending: 'warning', cancelled: 'danger' };
const STATUS_LABEL = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' };

const weekDates = [
    { label: 'Seg', date: '2026-03-09', day: '09' },
    { label: 'Ter', date: '2026-03-10', day: '10' },
    { label: 'Qua', date: '2026-03-11', day: '11' },
    { label: 'Qui', date: '2026-03-12', day: '12' },
    { label: 'Sex', date: '2026-03-13', day: '13' },
    { label: 'Sáb', date: '2026-03-14', day: '14' },
    { label: 'Dom', date: '2026-03-15', day: '15' },
];

function typeColor(type) {
    const m = { 'Retorno': 'primary', 'Consulta': 'accent', 'Teleconsulta': 'purple', 'Exame': 'warning' };
    return m[type] || 'primary';
}

export default function Agenda() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('2026-03-14');
    const [syncingSlot, setSyncingSlot] = useState(null);

    const dayAppts = appointments.filter(a => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    async function handleScheduleSlot(hour) {
        setSyncingSlot(hour);
        const newAppointment = {
            patientId: null,
            patientName: 'Novo agendamento',
            date: selectedDate,
            time: hour,
            duration: 30,
            type: 'Consulta',
            status: 'pending',
            via: 'presencial',
        };

        try {
            await syncAppointment(newAppointment, 'create');
            console.log(`[Agenda] Slot ${hour} synced with n8n`);
        } catch (error) {
            console.error('[Agenda] Failed to sync slot with n8n:', error);
        } finally {
            setSyncingSlot(null);
        }
    }

    return (
        <div className="agenda-page animate-fade">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Agenda</h1>
                        <p>{appointments.length} consultas programadas</p>
                    </div>
                    <button className="btn btn-primary btn-sm">
                        <Plus size={14} /> Nova Consulta
                    </button>
                </div>
            </div>

            <div className="agenda-layout">
                {/* Calendar sidebar */}
                <div className="agenda-sidebar">
                    <div className="card mini-cal">
                        <div className="mini-cal-header">
                            <button className="btn btn-ghost btn-icon btn-sm"><ChevronLeft size={15} /></button>
                            <span className="mini-cal-month">Março 2026</span>
                            <button className="btn btn-ghost btn-icon btn-sm"><ChevronRight size={15} /></button>
                        </div>
                        <div className="week-strip">
                            {weekDates.map(w => (
                                <button
                                    key={w.date}
                                    id={`day-${w.date}`}
                                    className={`week-day ${selectedDate === w.date ? 'active' : ''} ${w.date === '2026-03-14' ? 'today' : ''}`}
                                    onClick={() => setSelectedDate(w.date)}
                                >
                                    <span className="week-day-label">{w.label}</span>
                                    <span className="week-day-num">{w.day}</span>
                                    {appointments.some(a => a.date === w.date) && <span className="week-dot" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming list */}
                    <div className="card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Próximas consultas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {appointments.filter(a => a.date >= '2026-03-14').slice(0, 5).map(a => (
                                <div
                                    key={a.id}
                                    className="upcoming-item"
                                    onClick={() => { setSelectedDate(a.date); navigate('/agenda'); }}
                                >
                                    <div className="avatar avatar-sm" style={{ background: a.avatarColor + '22', color: a.avatarColor }}>
                                        {a.avatar}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600 }} className="truncate">{a.patientName}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {a.time}
                                        </p>
                                    </div>
                                    <span className={`badge badge-${STATUS_COLOR[a.status]}`} style={{ fontSize: 10, flexShrink: 0 }}>
                                        {STATUS_LABEL[a.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Day timeline */}
                <div className="card day-view">
                    <div className="day-view-header">
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                            <Calendar size={16} style={{ color: 'var(--primary)' }} />
                            {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <span className="badge badge-primary">{dayAppts.length} consulta{dayAppts.length !== 1 && 's'}</span>
                    </div>

                    <div className="timeline">
                        {HOURS.map(hour => {
                            const appt = dayAppts.find(a => a.time === hour);
                            return (
                                <div key={hour} className="timeline-row">
                                    <div className="timeline-hour">{hour}</div>
                                    <div className="timeline-slot">
                                        {appt ? (
                                            <div
                                                className={`appt-block appt-${typeColor(appt.type)}`}
                                                style={{ animationDelay: '0.1s' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                                    <div className="avatar avatar-sm" style={{ background: appt.avatarColor + '22', color: appt.avatarColor }}>
                                                        {appt.avatar}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: 13 }}>{appt.patientName}</p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                            {appt.type} · {appt.duration}min
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                    {appt.via === 'telehealth' ? (
                                                        <span className="badge badge-purple"><Video size={10} /> Teleconsulta</span>
                                                    ) : (
                                                        <span className="badge badge-muted"><MapPin size={10} /> Presencial</span>
                                                    )}
                                                    <span className={`badge badge-${STATUS_COLOR[appt.status]}`}>
                                                        {STATUS_LABEL[appt.status]}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="empty-slot">
                                                <span>Horário disponível</span>
                                                <button
                                                    className="btn btn-ghost btn-sm slot-add-btn"
                                                    onClick={() => handleScheduleSlot(hour)}
                                                    disabled={syncingSlot === hour}
                                                >
                                                    {syncingSlot === hour ? (
                                                        <><Loader2 size={12} className="spin-icon" /> Sincronizando...</>
                                                    ) : (
                                                        <><Plus size={12} /> Agendar</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
