import React, { useState, useCallback } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, Video, MapPin, Calendar, Loader2, Edit2, X, Check, Trash2, User, Activity, GripVertical } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
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
    const [editingAppt, setEditingAppt] = useState(null);
    const [dragOverHour, setDragOverHour] = useState(null);
    const [draggedApptId, setDraggedApptId] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const weekDates = getWeekDates(selectedDate);

    // Fetch from Supabase or fall back to mock
    const { data: dbAppointments, loading, refetch } = useSupabaseQuery(
        () => supabaseOn
            ? getAppointments({ from: weekDates[0].date, to: weekDates[6].date })
            : Promise.resolve(null),
        [supabaseOn, weekDates[0]?.date],
    );

    // Initialize/Update local state when data changes
    React.useEffect(() => {
        if (dbAppointments) {
            setAppointments(dbAppointments);
        } else if (!supabaseOn) {
            setAppointments(mockAppointments);
        }
    }, [dbAppointments, supabaseOn]);

    const allAppointments = appointments;
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
                const created = await createAppointment(newAppointment, doctor.id);
                setAppointments(prev => [...prev, created]);
            } else {
                await syncAppointment(newAppointment, 'create');
                // Mock mode local update
                const mockAppt = { 
                    ...newAppointment, 
                    id: `mock-${Date.now()}`,
                    avatar: 'NA',
                    avatarColor: '#64748B'
                };
                setAppointments(prev => [...prev, mockAppt]);
            }
            console.log(`[Agenda] Slot ${hour} synced`);
        } catch (error) {
            console.error('[Agenda] Failed to sync slot:', error);
        } finally {
            setSyncingSlot(null);
        }
    }

    async function handleUpdateAppointment(id, updates) {
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        
        try {
            if (supabaseOn) {
                await updateAppointment(id, updates);
                // No need to refetch if local state is already correct, 
                // but good for ensuring sync
            }
            setEditingAppt(null);
        } catch (error) {
            console.error('[Agenda] Failed to update appointment:', error);
            // Rollback if needed, but for now just log
        }
    }

    async function handleDeleteAppointment(id) {
        if (!window.confirm('Tem certeza que deseja excluir esta consulta?')) return;
        
        // Optimistic delete
        setAppointments(prev => prev.filter(a => a.id !== id));
        
        try {
            if (supabaseOn) {
                await deleteAppointment(id);
            }
            setEditingAppt(null);
        } catch (error) {
            console.error('[Agenda] Failed to delete appointment:', error);
        }
    }

    const onDragStart = (e, appt) => {
        setDraggedApptId(appt.id);
        e.dataTransfer.setData('appointmentId', appt.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const onDragEnd = (e) => {
        setDraggedApptId(null);
        e.currentTarget.classList.remove('dragging');
    };

    const onDragOver = (e, hour) => {
        e.preventDefault();
        setDragOverHour(hour);
    };

    const onDrop = async (e, hour) => {
        e.preventDefault();
        setDragOverHour(null);
        setDraggedApptId(null);
        const id = e.dataTransfer.getData('appointmentId');
        if (id) {
            await handleUpdateAppointment(id, { time: hour });
        }
    };

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
                                    <div 
                                        key={hour} 
                                        className={`timeline-row ${dragOverHour === hour ? 'drag-over' : ''}`}
                                        onDragOver={(e) => onDragOver(e, hour)}
                                        onDragLeave={() => setDragOverHour(null)}
                                        onDrop={(e) => onDrop(e, hour)}
                                    >
                                        <div className="timeline-hour">{hour}</div>
                                        <div className="timeline-slot">
                                            {appt ? (
                                                <div
                                                    className={`appt-block appt-${typeColor(appt.type)} ${draggedApptId === appt.id ? 'dragging-source' : ''}`}
                                                    style={{ animationDelay: '0.1s' }}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, appt)}
                                                    onDragEnd={onDragEnd}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                                        <div className="drag-handle">
                                                            <GripVertical size={16} />
                                                        </div>
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
                                                        <div className="appt-actions">
                                                            <button 
                                                                className="btn btn-ghost btn-icon btn-xs"
                                                                onClick={() => setEditingAppt(appt)}
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                        </div>
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

            {editingAppt && (
                <div className="modal-overlay" onClick={() => setEditingAppt(null)}>
                    <div className="modal-card animate-scale" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Edit2 size={20} style={{ color: 'var(--primary)' }} /> Editar Consulta</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditingAppt(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label><User size={14} /> Paciente</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="text" 
                                        className="input-modern w-full" 
                                        defaultValue={editingAppt.patientName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setEditingAppt(prev => ({ ...prev, patientName: val }));
                                        }}
                                        placeholder="Nome do Paciente"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label><Clock size={14} /> Horário</label>
                                    <select 
                                        className="select-modern" 
                                        defaultValue={editingAppt.time}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setEditingAppt(prev => ({ ...prev, time: val }));
                                        }}
                                    >
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><Activity size={14} /> Status</label>
                                    <select 
                                        className="select-modern" 
                                        defaultValue={editingAppt.status}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setEditingAppt(prev => ({ ...prev, status: val }));
                                        }}
                                    >
                                        {Object.entries(STATUS_LABEL).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div style={{ marginRight: 'auto' }}>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteAppointment(editingAppt.id)}
                                >
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                            <button className="btn btn-ghost" onClick={() => setEditingAppt(null)}>Cancelar</button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => handleUpdateAppointment(editingAppt.id, {
                                    patient_name: editingAppt.patientName,
                                    time: editingAppt.time,
                                    status: editingAppt.status
                                })}
                            >
                                <Check size={16} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
