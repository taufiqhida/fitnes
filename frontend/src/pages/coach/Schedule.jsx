import { useState, useEffect } from 'react';
import { Calendar, Check, Plus, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function Schedule() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [addingDate, setAddingDate] = useState(null);
    const [title, setTitle] = useState('Latihan Rutin');

    // Calendar state
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    useEffect(() => {
        if (user?.id) {
            fetchSchedule();
        }
    }, [user]);

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/schedule?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
            if (res.data.length > 0 && !selectedClient) {
                setSelectedClient(res.data[0]);
            } else if (selectedClient) {
                // Refresh selected client data
                const updated = res.data.find(c => c.id === selectedClient.id);
                if (updated) setSelectedClient(updated);
            }
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar navigation
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    };

    // Check if a date is scheduled
    const getScheduleForDate = (day) => {
        if (!day || !selectedClient?.schedules) return null;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return selectedClient.schedules.find(s => {
            const schedDate = new Date(s.date);
            const schedStr = `${schedDate.getFullYear()}-${String(schedDate.getMonth() + 1).padStart(2, '0')}-${String(schedDate.getDate()).padStart(2, '0')}`;
            return schedStr === dateStr;
        });
    };

    const isToday = (day) => {
        if (!day) return false;
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    const handleDayClick = (day) => {
        if (!day || !selectedClient) return;

        const schedule = getScheduleForDate(day);
        if (schedule) {
            // Date is already scheduled - delete it
            deleteSchedule(schedule.id);
        } else {
            // Open modal to add date
            setAddingDate(new Date(currentYear, currentMonth, day));
            setTitle('Latihan Rutin');
            setModalOpen(true);
        }
    };

    const addSchedule = async () => {
        if (!addingDate || !selectedClient) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/coach/schedule/${selectedClient.id}`, {
                date: addingDate.toISOString(),
                title
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalOpen(false);
            fetchSchedule();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menambah jadwal');
        }
    };

    const deleteSchedule = async (scheduleId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/coach/schedule/${scheduleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSchedule();
        } catch (error) {
            alert('Gagal menghapus jadwal');
        }
    };

    const calendarDays = generateCalendarDays();

    // Get schedules for current month
    const monthSchedules = selectedClient?.schedules?.filter(s => {
        const schedDate = new Date(s.date);
        return schedDate.getMonth() === currentMonth && schedDate.getFullYear() === currentYear;
    }) || [];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Jadwal Latihan</h1>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : clients.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Belum ada client</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem' }}>
                    {/* Client List Sidebar */}
                    <div className="data-card" style={{ height: 'fit-content' }}>
                        <div className="data-header">
                            <h3 className="data-title">Pilih Client</h3>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            {clients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: selectedClient?.id === client.id
                                            ? 'rgba(124, 58, 237, 0.2)'
                                            : 'transparent',
                                        border: selectedClient?.id === client.id
                                            ? '1px solid var(--primary)'
                                            : '1px solid transparent',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        color: selectedClient?.id === client.id
                                            ? 'var(--primary)'
                                            : 'var(--text-primary)',
                                        textAlign: 'left',
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    <User size={18} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{client.nama}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {client.schedules?.length || 0} jadwal
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    {selectedClient && (
                        <div>
                            <div className="data-card" style={{ marginBottom: '1.5rem' }}>
                                <div className="data-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button className="btn" onClick={prevMonth} style={{ padding: '0.5rem' }}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h3 className="data-title" style={{ margin: 0 }}>
                                        {MONTHS[currentMonth]} {currentYear}
                                    </h3>
                                    <button className="btn" onClick={nextMonth} style={{ padding: '0.5rem' }}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Klik tanggal untuk menambah/menghapus jadwal untuk <strong>{selectedClient.nama}</strong>
                                    </p>

                                    {/* Day headers */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(7, 1fr)',
                                        gap: '0.5rem',
                                        marginBottom: '0.75rem',
                                        textAlign: 'center'
                                    }}>
                                        {DAYS.map(day => (
                                            <div key={day} style={{
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.8rem'
                                            }}>
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(7, 1fr)',
                                        gap: '0.5rem'
                                    }}>
                                        {calendarDays.map((day, index) => {
                                            if (!day) {
                                                return <div key={`empty-${index}`} style={{ aspectRatio: '1' }} />;
                                            }

                                            const schedule = getScheduleForDate(day);
                                            const todayFlag = isToday(day);
                                            const isScheduled = !!schedule;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => handleDayClick(day)}
                                                    style={{
                                                        aspectRatio: '1',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '0.5rem',
                                                        border: todayFlag
                                                            ? '2px solid var(--primary)'
                                                            : isScheduled
                                                                ? '2px solid #10b981'
                                                                : '1px solid var(--border-color)',
                                                        background: isScheduled
                                                            ? 'rgba(16, 185, 129, 0.2)'
                                                            : 'rgba(15, 23, 42, 0.3)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: todayFlag ? 700 : 400,
                                                        color: isScheduled ? '#10b981' : 'var(--text-secondary)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {day}
                                                    {isScheduled && <Check size={12} style={{ marginTop: '2px' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        marginTop: '1.5rem',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981' }} />
                                            <span>Terjadwal (klik untuk hapus)</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(15, 23, 42, 0.3)', border: '1px solid var(--border-color)' }} />
                                            <span>Kosong (klik untuk tambah)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule List */}
                            <div className="data-card">
                                <div className="data-header">
                                    <h3 className="data-title">Jadwal {selectedClient.nama} - {MONTHS[currentMonth]} {currentYear}</h3>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    {monthSchedules.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                            Belum ada jadwal di bulan ini. Klik tanggal di kalender untuk menambah jadwal.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {monthSchedules.sort((a, b) => new Date(a.date) - new Date(b.date)).map(schedule => {
                                                const schedDate = new Date(schedule.date);
                                                const dayNum = schedDate.getDate();
                                                const dayName = DAYS[schedDate.getDay()];

                                                return (
                                                    <div
                                                        key={schedule.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '0.75rem 1rem',
                                                            background: schedule.completed
                                                                ? 'rgba(16, 185, 129, 0.1)'
                                                                : 'rgba(59, 130, 246, 0.05)',
                                                            borderRadius: '0.5rem',
                                                            border: `1px solid ${schedule.completed ? '#10b981' : 'rgba(59, 130, 246, 0.3)'}`
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{
                                                                fontWeight: 700,
                                                                fontSize: '1.2rem',
                                                                color: schedule.completed ? '#10b981' : '#3b82f6'
                                                            }}>
                                                                {dayNum}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 500 }}>{dayName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                    {schedule.title || 'Latihan'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {schedule.completed && (
                                                                <span style={{ color: '#10b981', fontSize: '0.8rem' }}>
                                                                    <Check size={14} /> Selesai
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => deleteSchedule(schedule.id)}
                                                                className="btn"
                                                                style={{ padding: '0.5rem', color: '#ef4444' }}
                                                                title="Hapus jadwal"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Schedule Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Jadwal">
                <div className="modal-body">
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Tambah jadwal untuk <strong>{selectedClient?.nama}</strong> pada tanggal{' '}
                        <strong>
                            {addingDate?.getDate()} {MONTHS[addingDate?.getMonth()]} {addingDate?.getFullYear()}
                        </strong>
                    </p>
                    <div className="form-group">
                        <label className="form-label">Judul Latihan</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Contoh: Latihan Kardio"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                        Batal
                    </button>
                    <button type="button" className="btn btn-primary" onClick={addSchedule}>
                        <Plus size={18} />
                        Tambah Jadwal
                    </button>
                </div>
            </Modal>
        </div>
    );
}
