import { useState, useEffect } from 'react';
import { Plus, Trash2, Video, ExternalLink, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIES = [
    { value: 'kurus', label: 'Kurus', color: 'var(--info)' },
    { value: 'normal', label: 'Normal', color: 'var(--success)' },
    { value: 'overweight', label: 'Overweight', color: 'var(--warning)' },
    { value: 'obesitas', label: 'Obesitas', color: 'var(--danger)' }
];

export default function Videos() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtubeUrl: '',
        category: 'normal'
    });

    useEffect(() => {
        if (user?.id) {
            fetchVideos();
        }
    }, [user]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/videos?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(res.data);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditMode(false);
        setEditId(null);
        setFormData({ title: '', description: '', youtubeUrl: '', category: 'normal' });
        setModalOpen(true);
    };

    const openEditModal = (video) => {
        setEditMode(true);
        setEditId(video.id);
        setFormData({
            title: video.title,
            description: video.description || '',
            youtubeUrl: video.youtubeUrl,
            category: video.category
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (editMode) {
                // Update existing video
                await axios.put(`${API_URL}/coach/videos/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Add new video
                await axios.post(`${API_URL}/coach/videos`, {
                    ...formData,
                    coachId: user.id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setModalOpen(false);
            setFormData({ title: '', description: '', youtubeUrl: '', category: 'normal' });
            setEditMode(false);
            setEditId(null);
            fetchVideos();
        } catch (error) {
            alert(editMode ? 'Gagal mengupdate video' : 'Gagal menambah video');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus video ini?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/coach/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
        } catch (error) {
            alert('Gagal menghapus video');
        }
    };

    const getYouTubeId = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    };

    const getCategoryInfo = (category) => {
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[1];
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Video Latihan</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={20} />
                    Tambah Video
                </button>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : videos.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Video size={48} />
                        <p>Belum ada video latihan</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openAddModal}>
                            Tambah Video Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {videos.map(video => {
                        const videoId = getYouTubeId(video.youtubeUrl);
                        const categoryInfo = getCategoryInfo(video.category);

                        return (
                            <div key={video.id} style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '1rem',
                                overflow: 'hidden'
                            }}>
                                {/* Thumbnail */}
                                <div style={{
                                    position: 'relative',
                                    paddingTop: '56.25%',
                                    background: '#0f172a'
                                }}>
                                    {videoId && (
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                            alt={video.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: categoryInfo.color,
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {categoryInfo.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{video.title}</h3>
                                    {video.description && (
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {video.description}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a
                                            href={video.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm"
                                            style={{
                                                flex: 1,
                                                background: 'rgba(124, 58, 237, 0.1)',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)'
                                            }}
                                        >
                                            <ExternalLink size={16} />
                                            Tonton
                                        </a>
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid #3b82f6',
                                                color: '#3b82f6'
                                            }}
                                            onClick={() => openEditModal(video)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(video.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Video Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editMode ? 'Edit Video' : 'Tambah Video'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">URL YouTube</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={formData.youtubeUrl}
                                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Judul Video</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Latihan Kardio 15 Menit"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deskripsi (opsional)</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="Deskripsi video..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kategori Client</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editMode ? 'Update' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
