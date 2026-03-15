import React, { useState, useCallback } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, Video, MapPin, Calendar, Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAppointments, createAppointment } from '../services/appointmentService';
import { syncAppointment } from '../services/n8nService';
import { useAuth } from '../context/AuthContext';
import useSupabaseQuery from '../hooks/useSupabaseQuery';
import useRealtime from '../hooks/useRealtime';
import { appointments as mockAppointments } from '../data/mock';
import './Agenda.css';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const STATUS_COLOR = { confirmed: 'accent', pending: 'warning', cancelled: 'danger' };
const STATUS_LABEL = { confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado' };

function getWeekDates(baseDate) {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));

    const names = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return names.map((label, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return {
            label,
            date: date.toISOString().split('T')[0],
            day: String(date.getDate()).padStart(2, '0'),
        };
    });
}

function typeColor(type) {
    const m = { 'Retorno': 'primary', 'Consulta': 'accent', 'Teleconsulta': 'purple', 'Exame': 'warning' };
    return m[type] || 'primary';
}

export default function Agenda() {
    const { doctor } = useAuth();
    const supabaseOn = isSupabaseConfigured();

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [syncingSlot, setSyncingSlot] = useState(null);
    const weekDates = getWeekDates(selectedDate);

    // Fetch from Supabase or fall back to mock
    const { data: dbAppointments, loading, refetch } = useSupabaseQuery(
        () => supabaseOn
            ? getAppointments({ from: weekDates[0].date, to: weekDates[6].date })
            : Promise.resolve(null),
        [supabaseOn, weekDates[0]?.date],
    );

    const allAppointments = dbAppointments || mockAppointments;
    const dayAppts = allAppointments
        .filter(a => a.date === selectedDate)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const upcomingAppts = allAppointments
        .filter(a => a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
        .slice(0, 5);

    // Realtime: auto-refresh on new appointment inserts
    useRealtime('appointments', '*', useCallback(() => {
        refetch();
    }, [refetch]), supabaseOn);

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
            if (supabaseOn && doctor?.id) {
                await createAppointment(newAppointment, doctor.id);
            } else {
                await syncAppointment(newAppointment, 'create');
            }
            console.log(`[Agenda] Slot ${hour} synced`);
            refetch();
        } catch (error) {
            console.error('[Agenda] Failed to sync slot:', error);
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
                        <p>{allAppointments.length} consultas programadas</p>
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
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 7);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}><ChevronLeft size={15} /></button>
                            <span className="mini-cal-month">
                                {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 7);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}><ChevronRight size={15} /></button>
                        </div>
                        <div className="week-strip">
                            {weekDates.map(w => (
                                <button
                                    key={w.date}
                                    id={`day-${w.date}`}
                                    className={`week-day ${selectedDate === w.date ? 'active' : ''} ${w.date === today ? 'today' : ''}`}
                                    onClick={() => setSelectedDate(w.date)}
                                >
                                    <span className="week-day-label">{w.label}</span>
                                    <span className="week-day-num">{w.day}</span>
                                    {allAppointments.some(a => a.date === w.date) && <span className="week-dot" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming list */}
                    <div className="card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Próximas consultas</h3>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                <Loader2 size={18} className="spin-icon" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {upcomingAppts.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Nenhuma consulta agendada</p>
                                ) : upcomingAppts.map(a => (
                                    <div
                                        key={a.id}
                                        className="upcoming-item"
                                        onClick={() => setSelectedDate(a.date)}
                                    >
                                        <div className="avatar avatar-sm" style={{ background: a.avatarColor + '22', color: a.avatarColor }}>
                                            {a.avatar}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600 }} className="truncate">{a.patientName}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {a.time}
                                            </p>
                                        </div>
                                        <span className={`badge badge-${STATUS_COLOR[a.status]}`} style={{ fontSize: 10, flexShrink: 0 }}>
                                            {STATUS_LABEL[a.status]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Day timeline */}
                <div className="card day-view">
                    <div className="day-view-header">
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                            <Calendar size={16} style={{ color: 'var(--primary)' }} />
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <span className="badge badge-primary">{dayAppts.length} consulta{dayAppts.length !== 1 && 's'}</span>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                            <Loader2 size={24} className="spin-icon" style={{ color: 'var(--primary)' }} />
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}
