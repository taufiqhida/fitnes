import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Ruler, Activity, User, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function ClientDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [imtHistory, setImtHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboard();
            fetchIMTHistory();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/dashboard?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIMTHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/imt-history?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Reverse to show oldest first for chart
            const chartData = res.data.slice().reverse().map(item => ({
                date: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                imt: parseFloat(item.imt.toFixed(1)),
                category: item.category
            }));
            setImtHistory(chartData);
        } catch (error) {
            console.error('Failed to fetch IMT history:', error);
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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem'
                }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
                    <p style={{ color: getCategoryColor(data.category) }}>
                        IMT: <strong>{data.imt}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {getCategoryLabel(data.category)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="empty-state">Loading...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            {/* Alerts */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {data?.hasTodayWorkout && !data?.workoutDone && (
                    <div style={{
                        flex: 1,
                        minWidth: '280px',
                        padding: '1rem 1.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <AlertCircle size={24} color="#ef4444" />
                        <div>
                            <p style={{ fontWeight: 600, color: '#ef4444' }}>Anda Lupa Olahraga!</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Jangan lupa latihan hari ini</p>
                        </div>
                    </div>
                )}
                {data?.workoutDone && (
                    <div style={{
                        flex: 1,
                        minWidth: '280px',
                        padding: '1rem 1.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <CheckCircle size={24} color="#10b981" />
                        <div>
                            <p style={{ fontWeight: 600, color: '#10b981' }}>Hebat! Latihan Hari Ini Selesai!</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pertahankan konsistensimu</p>
                        </div>
                    </div>
                )}
            </div>

            {/* IMT Gauge and Chart Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* IMT Gauge */}
                <div className="data-card">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>IMT Saat Ini</h3>

                        {/* Gauge */}
                        <div style={{
                            position: 'relative',
                            width: '180px',
                            height: '100px',
                            margin: '0 auto 1.5rem',
                            background: `conic-gradient(
                from 180deg,
                #3b82f6 0deg 45deg,
                #10b981 45deg 90deg,
                #f59e0b 90deg 135deg,
                #ef4444 135deg 180deg,
                transparent 180deg
              )`,
                            borderRadius: '180px 180px 0 0',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '120px',
                                height: '60px',
                                background: 'var(--bg-primary)',
                                borderRadius: '120px 120px 0 0'
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                textAlign: 'center'
                            }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: getCategoryColor(data?.category) }}>
                                    {data?.imt || '-'}
                                </p>
                            </div>
                        </div>

                        <span style={{
                            display: 'inline-block',
                            background: `${getCategoryColor(data?.category)}20`,
                            color: getCategoryColor(data?.category),
                            padding: '0.4rem 1.25rem',
                            borderRadius: '2rem',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}>
                            {getCategoryLabel(data?.category)}
                        </span>
                    </div>
                </div>

                {/* IMT Line Chart */}
                <div className="data-card">
                    <div className="data-header">
                        <h3 className="data-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} />
                            Kurva IMT
                        </h3>
                        <Link to="/client/imt" className="btn btn-sm btn-primary">
                            Input IMT Baru
                        </Link>
                    </div>
                    <div style={{ padding: '1.5rem', height: '250px' }}>
                        {imtHistory.length < 2 ? (
                            <div className="empty-state" style={{ height: '100%' }}>
                                <TrendingUp size={40} style={{ opacity: 0.5 }} />
                                <p>Input IMT minimal 2 kali untuk melihat kurva</p>
                                <Link to="/client/imt" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                                    Input Sekarang
                                </Link>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={imtHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-secondary)"
                                        fontSize={12}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    {/* Reference lines for BMI categories */}
                                    <ReferenceLine y={18.5} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: 'Kurus', fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                                    <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Overweight', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Obesitas', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="imt"
                                        stroke="#7c3aed"
                                        strokeWidth={4}
                                        dot={{ fill: '#7c3aed', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 8, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Scale size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{data?.weight || '-'} kg</h3>
                        <p>Berat Badan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Ruler size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{data?.height || '-'} cm</h3>
                        <p>Tinggi Badan</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <User size={28} />
                    </div>
                    <div className="stat-info">
                        <h3>{data?.coach?.nama || '-'}</h3>
                        <p>Pelatih</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="data-card" style={{ marginTop: '2rem' }}>
                <div className="data-header">
                    <h3 className="data-title">Aksi Cepat</h3>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link to="/client/imt" className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#3b82f6' }}>
                        <Scale size={18} />
                        Input IMT Baru
                    </Link>
                    <Link to="/client/schedule" className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981' }}>
                        <Activity size={18} />
                        Cek Jadwal Latihan
                    </Link>
                    <Link to="/client/chat" className="btn" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                        <User size={18} />
                        Chat dengan Pelatih
                    </Link>
                </div>
            </div>
        </div>
    );
}
