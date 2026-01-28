import { useState, useEffect } from 'react';
import { Apple, Utensils } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const MEAL_TYPES = [
    { key: 'sarapan', label: 'Sarapan', icon: '🌅' },
    { key: 'makan_siang', label: 'Makan Siang', icon: '☀️' },
    { key: 'makan_malam', label: 'Makan Malam', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍎' }
];

export default function FoodRecommendations() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.id) {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/food-recommendations?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
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

    const filteredRecommendations = filter === 'all'
        ? recommendations
        : recommendations.filter(r => r.mealType === filter);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Saran Makanan Sehat</h1>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : recommendations.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Apple size={48} />
                        <p>Belum ada saran makanan dari coach</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Coach Anda akan memberikan saran makanan sehat untuk membantu program fitness Anda
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
                        >
                            Semua
                        </button>
                        {MEAL_TYPES.map(type => (
                            <button
                                key={type.key}
                                onClick={() => setFilter(type.key)}
                                className={`btn ${filter === type.key ? 'btn-primary' : ''}`}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Recommendations Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1rem'
                    }}>
                        {filteredRecommendations.map(rec => {
                            let foodsList = [];
                            try {
                                foodsList = JSON.parse(rec.foods || '[]');
                            } catch (e) {
                                foodsList = [];
                            }

                            return (
                                <div
                                    key={rec.id}
                                    className="data-card"
                                    style={{ margin: 0 }}
                                >
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                background: 'rgba(16, 185, 129, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                {getMealIcon(rec.mealType)}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{rec.title}</h3>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#10b981',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '0.25rem'
                                                }}>
                                                    {getMealLabel(rec.mealType)}
                                                </span>
                                            </div>
                                        </div>

                                        {rec.description && (
                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.9rem',
                                                marginBottom: '1rem',
                                                lineHeight: 1.5
                                            }}>
                                                {rec.description}
                                            </p>
                                        )}

                                        {foodsList.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Rekomendasi Makanan:
                                                </p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {foodsList.map((food, i) => (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(16, 185, 129, 0.08)',
                                                                borderRadius: '0.5rem',
                                                                borderLeft: '3px solid #10b981'
                                                            }}
                                                        >
                                                            <Utensils size={14} color="#10b981" />
                                                            <span style={{ fontSize: '0.9rem' }}>{food}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            borderTop: '1px solid var(--border-color)',
                                            paddingTop: '0.75rem'
                                        }}>
                                            📅 {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredRecommendations.length === 0 && (
                        <div className="data-card">
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p>Tidak ada saran untuk kategori ini</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
