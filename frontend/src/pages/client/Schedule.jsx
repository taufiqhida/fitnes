import { useState, useEffect, useRef } from 'react';
import { Calendar, Check, X, Clock, Upload, Image, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = 'http://localhost:5002/api';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function ClientSchedule() {
    const { user } = useAuth();
    const [data, setData] = useState({ schedules: [], proofs: [] });
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' }); // success or error
    const fileInputRef = useRef(null);

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
            const res = await axios.get(`${API_URL}/client/schedule?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setError('');

        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Format file harus JPG, PNG, GIF, atau WEBP');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const openUploadModal = () => {
        setModalOpen(true);
        setPhoto(null);
        setPhotoPreview(null);
        setNotes('');
        setError('');
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000); // Hide after 3 seconds
    };

    const markAsDone = async () => {
        if (!photo) {
            setError('Foto bukti latihan wajib diupload');
            return;
        }

        setMarking(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('clientId', user.id);
            formData.append('photo', photo);
            formData.append('notes', notes || 'Latihan selesai');

            await axios.post(`${API_URL}/client/workout-done`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setModalOpen(false);

            // Wait a bit for backend to update, then refresh
            setTimeout(() => {
                fetchSchedule();
            }, 500);

            showToast('✅ Absen berhasil! Latihan telah tercatat.', 'success');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal menandai latihan';
            setError(errorMsg);
            showToast('❌ Absen gagal: ' + errorMsg, 'error');
        } finally {
            setMarking(false);
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
        if (!day || !data.schedules) return null;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return data.schedules.find(s => {
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

    const isPast = (day) => {
        if (!day) return false;
        const date = new Date(currentYear, currentMonth, day);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        return date < todayStart;
    };

    const calendarDays = generateCalendarDays();

    // Check today's schedule
    const todaySchedule = getScheduleForDate(today.getDate());
    const isTodayScheduled = currentMonth === today.getMonth() &&
        currentYear === today.getFullYear() &&
        !!todaySchedule;

    // Get all scheduled dates for current month as list
    const monthSchedules = data.schedules?.filter(s => {
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
            ) : data.schedules?.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Belum ada jadwal latihan</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Hubungi coach Anda untuk mengatur jadwal latihan
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Monthly Calendar */}
                    <div className="data-card" style={{ marginBottom: '2rem' }}>
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
                                    const pastFlag = isPast(day);

                                    let bgColor = 'rgba(15, 23, 42, 0.3)';
                                    let borderColor = 'transparent';
                                    let textColor = 'var(--text-secondary)';
                                    let icon = null;

                                    if (schedule) {
                                        if (schedule.completed) {
                                            bgColor = 'rgba(16, 185, 129, 0.2)';
                                            borderColor = '#10b981';
                                            textColor = '#10b981';
                                            icon = <Check size={12} />;
                                        } else if (pastFlag && !todayFlag) {
                                            bgColor = 'rgba(239, 68, 68, 0.2)';
                                            borderColor = '#ef4444';
                                            textColor = '#ef4444';
                                            icon = <X size={12} />;
                                        } else if (todayFlag) {
                                            bgColor = 'rgba(124, 58, 237, 0.2)';
                                            borderColor = 'var(--primary)';
                                            textColor = 'var(--primary)';
                                            icon = <Clock size={12} />;
                                        } else {
                                            bgColor = 'rgba(59, 130, 246, 0.1)';
                                            borderColor = 'rgba(59, 130, 246, 0.5)';
                                            textColor = '#3b82f6';
                                            icon = <Calendar size={12} />;
                                        }
                                    }

                                    return (
                                        <div
                                            key={day}
                                            style={{
                                                aspectRatio: '1',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '0.5rem',
                                                border: `2px solid ${borderColor}`,
                                                background: bgColor,
                                                fontSize: '0.9rem',
                                                fontWeight: todayFlag ? 700 : 400,
                                                color: textColor
                                            }}
                                        >
                                            {day}
                                            {icon && <span style={{ marginTop: '2px' }}>{icon}</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '1.5rem',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                fontSize: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981' }} />
                                    <span>Selesai</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444' }} />
                                    <span>Terlewat</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(124, 58, 237, 0.2)', border: '2px solid var(--primary)' }} />
                                    <span>Hari Ini</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.5)' }} />
                                    <span>Akan Datang</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule List for Current Month */}
                    <div className="data-card" style={{ marginBottom: '2rem' }}>
                        <div className="data-header">
                            <h3 className="data-title">Jadwal Bulan {MONTHS[currentMonth]} {currentYear}</h3>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            {monthSchedules.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                    Tidak ada jadwal di bulan ini
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {monthSchedules.map(schedule => {
                                        const schedDate = new Date(schedule.date);
                                        const dayNum = schedDate.getDate();
                                        const dayName = DAYS[schedDate.getDay()];
                                        const isPastDate = schedDate < new Date(today.setHours(0, 0, 0, 0));

                                        return (
                                            <div
                                                key={schedule.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem',
                                                    background: schedule.completed ? 'rgba(16, 185, 129, 0.1)' :
                                                        isPastDate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                                    borderRadius: '0.5rem',
                                                    border: `1px solid ${schedule.completed ? '#10b981' : isPastDate ? '#ef4444' : 'rgba(59, 130, 246, 0.3)'}`
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.2rem',
                                                        color: schedule.completed ? '#10b981' : isPastDate ? '#ef4444' : '#3b82f6'
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
                                                <div>
                                                    {schedule.completed ? (
                                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Check size={16} /> Selesai
                                                        </span>
                                                    ) : isPastDate ? (
                                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <X size={16} /> Terlewat
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Calendar size={16} /> Terjadwal
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Action */}
                    {currentMonth === today.getMonth() && currentYear === today.getFullYear() && isTodayScheduled && (
                        <div className="data-card">
                            <div className="data-header">
                                <h3 className="data-title">Latihan Hari Ini - {today.getDate()} {MONTHS[today.getMonth()]} {today.getFullYear()}</h3>
                            </div>
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                {todaySchedule?.completed ? (
                                    <>
                                        <div style={{
                                            width: 80,
                                            height: 80,
                                            margin: '0 auto 1rem',
                                            borderRadius: '50%',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Check size={40} color="#10b981" />
                                        </div>
                                        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Latihan Selesai!</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>Kerja bagus! Pertahankan konsistensimu.</p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                            Jangan lupa untuk latihan hari ini sesuai jadwal!
                                        </p>
                                        <button className="btn btn-primary" onClick={openUploadModal}>
                                            <Upload size={18} />
                                            Absen Latihan (Upload Foto)
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Upload Photo Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Absen Latihan">
                <div className="modal-body">
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem 1rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            Foto Bukti Latihan <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Format: JPG, PNG, GIF, WEBP. Maksimal 5MB
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />

                        {photoPreview ? (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border-color)'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn"
                                    style={{
                                        position: 'absolute',
                                        bottom: '0.5rem',
                                        right: '0.5rem',
                                        background: 'rgba(0,0,0,0.7)',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Ganti Foto
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(15, 23, 42, 0.5)'
                                }}
                            >
                                <Image size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>Klik untuk upload foto</p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Catatan (opsional)</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Contoh: Push up 20x, Sit up 30x..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                        Batal
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={markAsDone}
                        disabled={marking || !photo}
                    >
                        <Check size={18} />
                        {marking ? 'Menyimpan...' : 'Selesai Latihan'}
                    </button>
                </div>
            </Modal>

            {/* Toast Notification */}
            {
                toast.show && (
                    <div style={{
                        position: 'fixed',
                        top: '2rem',
                        right: '2rem',
                        background: toast.type === 'success'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        padding: '1rem 1.5rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        minWidth: '300px',
                        maxWidth: '500px',
                        animation: 'slideIn 0.3s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.95rem',
                        fontWeight: 500
                    }}>
                        {toast.type === 'success' ? (
                            <Check size={24} style={{ flexShrink: 0 }} />
                        ) : (
                            <X size={24} style={{ flexShrink: 0 }} />
                        )}
                        <span>{toast.message}</span>
                    </div>
                )
            }

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div >
    );
}
