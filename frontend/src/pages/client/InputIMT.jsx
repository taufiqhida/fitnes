import { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function InputIMT() {
    const { user } = useAuth();
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/imt-history?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/client/imt`, {
                clientId: user.id,
                weight: parseFloat(weight),
                height: parseFloat(height)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
            fetchHistory();
        } catch (error) {
            alert('Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'kurus': return '#3b82f6';
            case 'normal': return '#10b981';
            case 'overweight': return '#f59e0b';
            case 'obesitas': return '#ef4444';
            default: return '#6b7280';
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
                <h1 className="page-title">Input IMT</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Calculator */}
                <div className="data-card">
                    <div className="data-header">
                        <h3 className="data-title">Kalkulator IMT</h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Contoh: 65"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tinggi Badan (cm)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Contoh: 170"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                <Calculator size={18} />
                                {loading ? 'Menghitung...' : 'Hitung & Simpan'}
                            </button>
                        </form>

                        {result && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1.5rem',
                                background: 'rgba(15, 23, 42, 0.5)',
                                borderRadius: '1rem',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '3rem', fontWeight: 700, color: getCategoryColor(result.category) }}>
                                    {result.imt}
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    background: `${getCategoryColor(result.category)}20`,
                                    color: getCategoryColor(result.category),
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '2rem',
                                    fontWeight: 600
                                }}>
                                    {getCategoryLabel(result.category)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="data-card">
                    <div className="data-header">
                        <h3 className="data-title">Riwayat IMT</h3>
                    </div>
                    <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {history.length === 0 ? (
                            <div className="empty-state">
                                <TrendingUp size={48} />
                                <p>Belum ada riwayat</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {history.map((record) => (
                                    <div key={record.id} style={{
                                        padding: '1rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 600, color: getCategoryColor(record.category) }}>
                                                IMT: {record.imt.toFixed(1)}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {record.weight} kg | {record.height} cm
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                background: `${getCategoryColor(record.category)}20`,
                                                color: getCategoryColor(record.category),
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {getCategoryLabel(record.category)}
                                            </span>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                {new Date(record.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
