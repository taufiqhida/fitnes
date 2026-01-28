import { useState, useEffect } from 'react';
import { Users, UserCheck, Video, MessageCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalCoaches: 0,
        totalVideos: 24,
        totalConsultations: 156
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: Users,
            iconClass: 'purple',
            value: stats.totalClients,
            label: 'Total Client'
        },
        {
            icon: UserCheck,
            iconClass: 'green',
            value: stats.totalCoaches,
            label: 'Total Pelatih'
        },
        {
            icon: Video,
            iconClass: 'blue',
            value: stats.totalVideos,
            label: 'Video Latihan'
        },
        {
            icon: MessageCircle,
            iconClass: 'orange',
            value: stats.totalConsultations,
            label: 'Konsultasi'
        }
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className={`stat-icon ${stat.iconClass}`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>{loading ? '...' : stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="data-card">
                <div className="data-header">
                    <h3 className="data-title">Selamat Datang di PEVITA Admin</h3>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>Kelola pelatih dan client Anda dari dashboard ini.</p>
                    <p>Gunakan menu di sidebar untuk mengakses fitur lainnya.</p>
                </div>
            </div>
        </div>
    );
}
