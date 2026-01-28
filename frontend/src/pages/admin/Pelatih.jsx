import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import axios from 'axios';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL;

export default function Pelatih() {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coaches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoaches(res.data);
        } catch (error) {
            console.error('Failed to fetch coaches:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCoach(null);
        setFormData({ nama: '', email: '', phone: '', password: '' });
        setModalOpen(true);
    };

    const openEditModal = (coach) => {
        setEditingCoach(coach);
        setFormData({
            nama: coach.nama,
            email: coach.email,
            phone: coach.phone || '',
            password: ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editingCoach) {
                await axios.put(`${API_URL}/coaches/${editingCoach.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/coaches`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setModalOpen(false);
            fetchCoaches();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pelatih ini?')) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/coaches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCoaches();
        } catch (error) {
            alert('Gagal menghapus pelatih');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pelatih</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={20} />
                    Tambah Pelatih
                </button>
            </div>

            <div className="data-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>No. HP</th>
                            <th>Tanggal Daftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : coaches.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <Users size={48} />
                                        <p>Belum ada pelatih</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            coaches.map(coach => (
                                <tr key={coach.id}>
                                    <td>{coach.nama}</td>
                                    <td>{coach.email}</td>
                                    <td>{coach.phone || '-'}</td>
                                    <td>{formatDate(coach.createdAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => openEditModal(coach)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(coach.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCoach ? 'Edit Pelatih' : 'Tambah Pelatih'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Nama</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">No. HP</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Password {editingCoach && '(kosongkan jika tidak diubah)'}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingCoach}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
