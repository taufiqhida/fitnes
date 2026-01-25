import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Scale, Ruler, Activity, Send, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = 'http://localhost:5002/api';

export default function ClientDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        exercises: ''
    });

    useEffect(() => {
        fetchClient();
    }, [id]);

    const fetchClient = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClient(res.data);
        } catch (error) {
            console.error('Failed to fetch client:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'kurus': return 'var(--info)';
            case 'normal': return 'var(--success)';
            case 'overweight': return 'var(--warning)';
            case 'obesitas': return 'var(--danger)';
            default: return 'var(--text-secondary)';
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'kurus': return 'Kurus';
            case 'normal': return 'Normal';
            case 'overweight': return 'Overweight';
            case 'obesitas': return 'Obesitas';
            default: return '-';
        }
    };

    const handleRecommend = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/coach/clients/${id}/recommend`, {
                coachId: user.id,
                title: formData.title,
                description: formData.description,
                exercises: formData.exercises.split('\n').filter(e => e.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalOpen(false);
            setFormData({ title: '', description: '', exercises: '' });
            fetchClient();
        } catch (error) {
            alert('Gagal mengirim rekomendasi');
        }
    };

    if (loading) {
        return <div className="empty-state">Loading...</div>;
    }

    if (!client) {
        return <div className="empty-state">Client tidak ditemukan</div>;
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/coach/clients" className="btn btn-sm" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="page-title">{client.nama}</h1>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    <Send size={18} />
                    Beri Rekomendasi
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Scale size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{client.weight || '-'} kg</h3>
                        <p>Berat Badan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Ruler size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{client.height || '-'} cm</h3>
                        <p>Tinggi Badan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Activity size={28} />
                    </div>
                    <div className="stat-info">
                        <h3 style={{ color: getCategoryColor(client.category) }}>{client.imt || '-'}</h3>
                        <p>IMT</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: `${getCategoryColor(client.category)}20`, color: getCategoryColor(client.category) }}>
                        <Activity size={28} />
                    </div>
                    <div className="stat-info">
                        <h3 style={{ color: getCategoryColor(client.category) }}>{getCategoryLabel(client.category)}</h3>
                        <p>Kategori</p>
                    </div>
                </div>
            </div>

            {/* IMT Chart */}
            <div className="data-card" style={{ marginBottom: '2rem' }}>
                <div className="data-header">
                    <h3 className="data-title">Kurva IMT</h3>
                </div>
                <div style={{ padding: '2rem' }}>
                    {client.imtHistory.length === 0 ? (
                        <div className="empty-state">
                            <p>Belum ada riwayat IMT</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', justifyContent: 'center' }}>
                            {/* Simple bar chart */}
                            {client.imtHistory.slice().reverse().map((record, index) => (
                                <div key={record.id} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '60px',
                                        height: `${Math.min(record.imt * 5, 150)}px`,
                                        background: `linear-gradient(to top, ${getCategoryColor(record.category)}, ${getCategoryColor(record.category)}80)`,
                                        borderRadius: '0.5rem 0.5rem 0 0',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        paddingTop: '0.5rem'
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{record.imt.toFixed(1)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {new Date(record.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Workout Proofs */}
            <div className="data-card" style={{ marginBottom: '2rem' }}>
                <div className="data-header">
                    <h3 className="data-title">Bukti Latihan</h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {client.workoutProofs.length === 0 ? (
                        <div className="empty-state">
                            <p>Belum ada bukti latihan</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {client.workoutProofs.map(proof => (
                                <div key={proof.id} style={{
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {proof.imageUrl && (
                                        <img
                                            src={`http://localhost:5002${proof.imageUrl}`}
                                            alt="Bukti latihan"
                                            style={{
                                                width: '100%',
                                                height: '180px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <div style={{ padding: '1rem' }}>
                                        <p style={{ marginBottom: '0.5rem' }}>{proof.notes || 'Latihan selesai'}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(proof.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            <div className="data-card">
                <div className="data-header">
                    <h3 className="data-title">Rekomendasi yang Diberikan</h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {client.recommendations.length === 0 ? (
                        <div className="empty-state">
                            <p>Belum ada rekomendasi</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {client.recommendations.map(rec => (
                                <div key={rec.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    borderRadius: '0.75rem',
                                    borderLeft: '3px solid var(--success)'
                                }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>{rec.title}</h4>
                                    {rec.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{rec.description}</p>}
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(rec.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendation Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Rekomendasi Latihan">
                <form onSubmit={handleRecommend}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Judul</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Program Latihan Minggu Ini"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="Deskripsi program latihan..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Daftar Latihan (satu per baris)</label>
                            <textarea
                                className="form-input"
                                rows={5}
                                placeholder="Push up 3x10
Squat 3x15
Plank 30 detik"
                                value={formData.exercises}
                                onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Kirim Rekomendasi
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
