import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5002/api';

export default function CoachDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({ totalClients: 0, clients: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboard();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/coach/dashboard?coachId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
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
                <h1 className="page-title">Dashboard</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Users size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{loading ? '...' : data.totalClients}</h3>
                        <p>Total Client</p>
                    </div>
                </div>
            </div>

            <div className="data-card">
                <div className="data-header">
                    <h3 className="data-title">Client Saya</h3>
                    <Link to="/coach/clients" className="btn btn-primary btn-sm">
                        Lihat Semua
                    </Link>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div className="empty-state">Loading...</div>
                    ) : data.clients.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>Belum ada client</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {data.clients.map(client => (
                                <div key={client.id} className="client-card" style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ marginBottom: '0.25rem' }}>{client.nama}</h4>
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

                                    {client.imt && (
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                            IMT: <strong style={{ color: 'var(--text-primary)' }}>{client.imt}</strong>
                                        </p>
                                    )}

                                    <Link
                                        to={`/coach/clients/${client.id}`}
                                        className="btn btn-sm"
                                        style={{
                                            width: '100%',
                                            background: 'rgba(124, 58, 237, 0.1)',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)'
                                        }}
                                    >
                                        <Eye size={16} />
                                        Lihat Detail
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
