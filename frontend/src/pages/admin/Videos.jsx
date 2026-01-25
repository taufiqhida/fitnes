import { useState, useEffect } from 'react';
import { Video, ExternalLink, User, Search, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

const CATEGORIES = [
    { value: 'all', label: 'Semua Kategori', color: 'var(--text-secondary)' },
    { value: 'kurus', label: 'Kurus', color: 'var(--info)' },
    { value: 'normal', label: 'Normal', color: 'var(--success)' },
    { value: 'overweight', label: 'Overweight', color: 'var(--warning)' },
    { value: 'obesitas', label: 'Obesitas', color: 'var(--danger)' }
];

export default function Videos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        fetchAllVideos();
    }, []);

    const fetchAllVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/videos`, {
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
        return CATEGORIES.find(c => c.value === category) || CATEGORIES[2]; // default normal
    };

    const filteredVideos = videos.filter(video => {
        const matchSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.coach?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = categoryFilter === 'all' || video.category === categoryFilter;
        return matchSearch && matchCategory;
    });

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
                <h1 className="page-title">Video Latihan</h1>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}>
                        <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Cari video atau coach..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.9rem',
                                width: '200px'
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}>
                        <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value} style={{ background: '#1e293b' }}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div className="stat-card" style={{ padding: '1rem' }}>
                    <div className="stat-info">
                        <h3>{videos.length}</h3>
                        <p>Total Video</p>
                    </div>
                </div>
                <div className="stat-card" style={{ padding: '1rem' }}>
                    <div className="stat-info">
                        <h3>{new Set(videos.map(v => v.coachId)).size}</h3>
                        <p>Coach Aktif</p>
                    </div>
                </div>
                <div className="stat-card" style={{ padding: '1rem' }}>
                    <div className="stat-info">
                        <h3>{videos.filter(v => v.category === 'kurus').length}</h3>
                        <p>Video Kurus</p>
                    </div>
                </div>
                <div className="stat-card" style={{ padding: '1rem' }}>
                    <div className="stat-info">
                        <h3>{videos.filter(v => v.category === 'obesitas').length}</h3>
                        <p>Video Obesitas</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Loading...</div>
            ) : filteredVideos.length === 0 ? (
                <div className="data-card">
                    <div className="empty-state">
                        <Video size={48} />
                        <p>Belum ada video latihan yang diupload</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredVideos.map(video => {
                        const videoId = getYouTubeId(video.youtubeUrl);
                        const categoryInfo = getCategoryInfo(video.category);

                        return (
                            <div key={video.id} style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s'
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

                                    {/* Coach Info */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        borderRadius: '0.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            {video.coach?.nama?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                                {video.coach?.nama || 'Unknown Coach'}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                Coach • {formatDate(video.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={video.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm"
                                        style={{
                                            width: '100%',
                                            background: 'rgba(124, 58, 237, 0.1)',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <ExternalLink size={16} />
                                        Tonton di YouTube
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
