import { useState, useEffect } from 'react';
import { Apple, Plus, Trash2, User, Utensils } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const API_URL = import.meta.env.VITE_API_URL;

const MEAL_TYPES = [
    { key: 'sarapan', label: 'Sarapan', icon: '🌅' },
    { key: 'makan_siang', label: 'Makan Siang', icon: '☀️' },
    { key: 'makan_malam', label: 'Makan Malam', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍎' }
];

export default function FoodRecommendations() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mealType, setMealType] = useState('sarapan');
    const [foods, setFoods] = useState(['']);

    useEffect(() => {
        if (user?.id) {
            fetchClients();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClient) {
            fetchRecommendations();
        }
    }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/clients?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
            if (res.data.length > 0) {
                setSelectedClient(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/food-recommendations/${selectedClient.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const openAddModal = () => {
        setTitle('');
        setDescription('');
        setMealType('sarapan');
        setFoods(['']);
        setModalOpen(true);
    };

    const addFood = () => {
        setFoods([...foods, '']);
    };

    const updateFood = (index, value) => {
        const newFoods = [...foods];
        newFoods[index] = value;
        setFoods(newFoods);
    };

    const removeFood = (index) => {
        setFoods(foods.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('Judul wajib diisi');
            return;
        }

        const filteredFoods = foods.filter(f => f.trim());
        if (filteredFoods.length === 0) {
            alert('Minimal satu makanan harus diisi');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/coach/food-recommendations`, {
                clientId: selectedClient.id,
                coachId: user.id,
                title,
                description,
                mealType,
                foods: filteredFoods
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalOpen(false);
            fetchRecommendations();
        } catch (error) {
            alert('Gagal menambah saran makanan');
        }
    };

    const deleteRecommendation = async (id) => {
        if (!confirm('Hapus saran makanan ini?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/coach/food-recommendations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecommendations();
        } catch (error) {
            alert('Gagal menghapus saran makanan');
        }
    };

    const getMealIcon = (type) => {
        const meal = MEAL_TYPES.find(m => m.key === type);
        return meal?.icon || '🍽️';
    };

    const getMealLabel = (type) => {
        const meal = MEAL_TYPES.find(m => m.key === type);
        return meal?.label || type;
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Saran Makanan Sehat</h1>
                {selectedClient && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Tambah Saran
                    </button>
                )}
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : clients.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Apple size={48} />
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
                                    <span style={{ fontWeight: 500 }}>{client.nama}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations List */}
                    <div>
                        {selectedClient && (
                            <div className="data-card">
                                <div className="data-header">
                                    <h3 className="data-title">
                                        Saran untuk {selectedClient.nama}
                                    </h3>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    {recommendations.length === 0 ? (
                                        <div className="empty-state" style={{ padding: '2rem' }}>
                                            <Utensils size={40} style={{ opacity: 0.5 }} />
                                            <p>Belum ada saran makanan</p>
                                            <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '1rem' }}>
                                                <Plus size={18} />
                                                Tambah Saran Pertama
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {recommendations.map(rec => {
                                                let foodsList = [];
                                                try {
                                                    foodsList = JSON.parse(rec.foods || '[]');
                                                } catch (e) {
                                                    foodsList = [];
                                                }

                                                return (
                                                    <div
                                                        key={rec.id}
                                                        style={{
                                                            padding: '1rem',
                                                            background: 'rgba(16, 185, 129, 0.05)',
                                                            borderRadius: '0.75rem',
                                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                                    <span style={{ fontSize: '1.2rem' }}>{getMealIcon(rec.mealType)}</span>
                                                                    <h4 style={{ margin: 0, fontWeight: 600 }}>{rec.title}</h4>
                                                                </div>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                    {getMealLabel(rec.mealType)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteRecommendation(rec.id)}
                                                                className="btn"
                                                                style={{ padding: '0.5rem', color: '#ef4444' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>

                                                        {rec.description && (
                                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                                                {rec.description}
                                                            </p>
                                                        )}

                                                        {foodsList.length > 0 && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                                {foodsList.map((food, i) => (
                                                                    <span
                                                                        key={i}
                                                                        style={{
                                                                            padding: '0.25rem 0.75rem',
                                                                            background: 'rgba(16, 185, 129, 0.15)',
                                                                            borderRadius: '1rem',
                                                                            fontSize: '0.85rem',
                                                                            color: '#10b981'
                                                                        }}
                                                                    >
                                                                        🥗 {food}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                                            {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Recommendation Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Saran Makanan">
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Judul *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Contoh: Menu Sarapan Sehat"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Waktu Makan</label>
                        <select
                            className="form-input"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                        >
                            {MEAL_TYPES.map(type => (
                                <option key={type.key} value={type.key}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Deskripsi</label>
                        <textarea
                            className="form-input"
                            rows={2}
                            placeholder="Penjelasan singkat (opsional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Daftar Makanan *</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {foods.map((food, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={`Makanan ${index + 1}`}
                                        value={food}
                                        onChange={(e) => updateFood(index, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    {foods.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => removeFood(index)}
                                            style={{ padding: '0.5rem', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn"
                                onClick={addFood}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                <Plus size={16} />
                                Tambah Makanan
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                        Batal
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                        <Plus size={18} />
                        Simpan Saran
                    </button>
                </div>
            </Modal>
        </div>
    );
}
