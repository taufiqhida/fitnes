import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import axios from 'axios';
import Modal from '../../components/Modal';

const API_URL = 'http://localhost:5002/api';

export default function Client() {
    const [clients, setClients] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        phone: '',
        password: '',
        coachId: ''
    });

    useEffect(() => {
        fetchClients();
        fetchCoaches();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoaches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coaches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoaches(res.data);
        } catch (error) {
            console.error('Failed to fetch coaches:', error);
        }
    };

    const openAddModal = () => {
        setEditingClient(null);
        setFormData({ nama: '', email: '', phone: '', password: '', coachId: '' });
        setModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            nama: client.nama,
            email: client.email,
            phone: client.phone || '',
            password: '',
            coachId: client.coachId || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editingClient) {
                await axios.put(`${API_URL}/clients/${editingClient.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/clients`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setModalOpen(false);
            fetchClients();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus client ini?')) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClients();
        } catch (error) {
            alert('Gagal menghapus client');
        }
    };

    const handleCoachAssign = async (clientId, coachId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API_URL}/clients/${clientId}/assign`,
                { coachId: coachId || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchClients();
        } catch (error) {
            alert('Gagal mengubah pelatih');
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
                <h1 className="page-title">Client</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={20} />
                    Tambah Client
                </button>
            </div>

            <div className="data-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>No. HP</th>
                            <th>Pelatih</th>
                            <th>Tanggal Daftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : clients.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state">
                                        <Users size={48} />
                                        <p>Belum ada client</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            clients.map(client => (
                                <tr key={client.id}>
                                    <td>{client.nama}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phone || '-'}</td>
                                    <td>
                                        <select
                                            className="coach-select"
                                            value={client.coachId || ''}
                                            onChange={(e) => handleCoachAssign(client.id, e.target.value)}
                                        >
                                            <option value="">-- Pilih Pelatih --</option>
                                            {coaches.map(coach => (
                                                <option key={coach.id} value={coach.id}>
                                                    {coach.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{formatDate(client.createdAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => openEditModal(client)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(client.id)}
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
                title={editingClient ? 'Edit Client' : 'Tambah Client'}
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
                            <label className="form-label">Pelatih</label>
                            <select
                                className="form-input"
                                value={formData.coachId}
                                onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                            >
                                <option value="">-- Pilih Pelatih --</option>
                                {coaches.map(coach => (
                                    <option key={coach.id} value={coach.id}>
                                        {coach.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Password {editingClient && '(kosongkan jika tidak diubah)'}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingClient}
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
