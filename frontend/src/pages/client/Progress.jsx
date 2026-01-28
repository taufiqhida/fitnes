import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Plus, Calendar, Image, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Progress() {
    const { user } = useAuth();
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user?.id) {
            fetchProgress();
        }
    }, [user]);

    const fetchProgress = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/progress?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProofs(res.data);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setError('');

        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Format file harus JPG, PNG, GIF, atau WEBP');
            return;
        }

        // Validate file size (5MB)
        if (file.size > MAX_FILE_SIZE) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const openModal = () => {
        setModalOpen(true);
        setPhoto(null);
        setPhotoPreview(null);
        setNotes('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            setError('Foto bukti latihan wajib diupload');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('clientId', user.id);
            formData.append('photo', photo);
            formData.append('notes', notes);

            await axios.post(`${API_URL}/client/progress`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setModalOpen(false);
            fetchProgress();
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal menyimpan');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Progres</h1>
                <button className="btn btn-primary" onClick={openModal}>
                    <Plus size={20} />
                    Tambah Catatan
                </button>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : proofs.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <TrendingUp size={48} />
                        <p>Belum ada catatan progres</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openModal}>
                            Tambah Catatan Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div className="data-card">
                    <div className="data-header">
                        <h3 className="data-title">Riwayat Latihan</h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{
                            position: 'relative',
                            paddingLeft: '2rem',
                            borderLeft: '2px solid var(--primary)'
                        }}>
                            {proofs.map((proof, index) => (
                                <div
                                    key={proof.id}
                                    style={{
                                        position: 'relative',
                                        paddingBottom: index === proofs.length - 1 ? 0 : '1.5rem'
                                    }}
                                >
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-2.5rem',
                                        top: 0,
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        border: '3px solid var(--bg-secondary)'
                                    }} />

                                    {/* Content */}
                                    <div style={{
                                        padding: '1rem 1.25rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        borderRadius: '0.75rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Calendar size={14} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(proof.createdAt).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        {proof.imageUrl && (
                                            <img
                                                src={`http://localhost:5002${proof.imageUrl}`}
                                                alt="Bukti latihan"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.5rem',
                                                    marginBottom: '0.75rem'
                                                }}
                                            />
                                        )}
                                        <p>{proof.notes || 'Latihan selesai'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Catatan">
                <form onSubmit={handleSubmit}>
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
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>atau drag & drop</p>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Catatan Latihan</label>
                            <textarea
                                className="form-input"
                                rows={5}
                                placeholder="Contoh: Hari ini saya berhasil lari 3 km dan push up 20 kali..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting || !photo}>
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
