import { useState, useEffect } from 'react';
import { FileText, Dumbbell } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Recommendations() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/recommendations?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Rekomendasi</h1>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : recommendations.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Belum ada rekomendasi dari coach</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {recommendations.map((rec) => {
                        let exercises = [];
                        try {
                            exercises = JSON.parse(rec.exercises || '[]');
                        } catch (e) {
                            exercises = [];
                        }

                        return (
                            <div key={rec.id} className="data-card">
                                <div className="data-header">
                                    <h3 className="data-title">{rec.title}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    {rec.description && (
                                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                            {rec.description}
                                        </p>
                                    )}

                                    {exercises.length > 0 && (
                                        <div>
                                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Dumbbell size={18} />
                                                Daftar Latihan
                                            </h4>
                                            <ul style={{
                                                listStyle: 'none',
                                                padding: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem'
                                            }}>
                                                {exercises.map((exercise, index) => (
                                                    <li
                                                        key={index}
                                                        style={{
                                                            padding: '1rem',
                                                            background: 'rgba(15, 23, 42, 0.5)',
                                                            borderRadius: '0.75rem',
                                                            borderLeft: '3px solid var(--primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '1rem'
                                                        }}
                                                    >
                                                        <span style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            background: 'var(--primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            flexShrink: 0
                                                        }}>
                                                            {index + 1}
                                                        </span>
                                                        {exercise}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
