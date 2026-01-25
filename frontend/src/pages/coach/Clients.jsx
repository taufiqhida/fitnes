import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5002/api';

export default function CoachClients() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchClients();
        }
    }, [user]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/clients?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Client Saya</h1>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : clients.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Users size={48} />
                        <p>Belum ada client yang ditugaskan kepada Anda</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {clients.map(client => (
                        <div key={client.id} style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '1rem',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.25rem' }}>{client.nama}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{client.email}</p>
                                </div>
                                {client.category && (
                                    <span style={{
                                        background: `${getCategoryColor(client.category)}20`,
                                        color: getCategoryColor(client.category),
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {getCategoryLabel(client.category)}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Berat</p>
                                    <p style={{ fontWeight: 600 }}>{client.weight || '-'} kg</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Tinggi</p>
                                    <p style={{ fontWeight: 600 }}>{client.height || '-'} cm</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>IMT</p>
                                    <p style={{ fontWeight: 600, color: getCategoryColor(client.category) }}>{client.imt || '-'}</p>
                                </div>
                            </div>

                            <Link
                                to={`/coach/clients/${client.id}`}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                <Eye size={16} />
                                Lihat Detail & Kurva IMT
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
