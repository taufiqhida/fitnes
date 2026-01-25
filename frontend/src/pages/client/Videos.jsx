import { useState, useEffect } from 'react';
import { Video, ExternalLink, Filter } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5002/api';

const CATEGORIES = [
    { value: 'all', label: 'Semua' },
    { value: 'kurus', label: 'Kurus', color: '#3b82f6' },
    { value: 'normal', label: 'Normal', color: '#10b981' },
    { value: 'overweight', label: 'Overweight', color: '#f59e0b' },
    { value: 'obesitas', label: 'Obesitas', color: '#ef4444' }
];

export default function ClientVideos() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user?.id) {
            fetchVideos();
        }
    }, [user]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client/videos?clientId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(res.data);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeId = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    };

    const getCategoryInfo = (category) => {
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[2];
    };

    const filteredVideos = filter === 'all'
        ? videos
        : videos.filter(v => v.category === filter);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Video Latihan</h1>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setFilter(cat.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem',
                            border: filter === cat.value ? 'none' : '1px solid var(--border-color)',
                            background: filter === cat.value
                                ? (cat.color || 'var(--primary)')
                                : 'transparent',
                            color: filter === cat.value ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : filteredVideos.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Video size={48} />
                        <p>Belum ada video untuk kategori ini</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredVideos.map(video => {
                        const videoId = getYouTubeId(video.youtubeUrl);
                        const categoryInfo = getCategoryInfo(video.category);

                        return (
                            <div key={video.id} style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '1rem',
                                overflow: 'hidden'
                            }}>
                                {/* Thumbnail */}
                                <div style={{
                                    position: 'relative',
                                    paddingTop: '56.25%',
                                    background: '#0f172a'
                                }}>
                                    {videoId && (
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                            alt={video.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: categoryInfo.color,
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {categoryInfo.label}
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{video.title}</h3>
                                    {video.description && (
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {video.description}
                                        </p>
                                    )}

                                    <a
                                        href={video.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                    >
                                        <ExternalLink size={16} />
                                        Tonton Video
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
