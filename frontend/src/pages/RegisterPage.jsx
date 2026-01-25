import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Phone, User, Lock, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export default function RegisterPage() {
    const [nama, setNama] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [coachId, setCoachId] = useState('');
    const [coaches, setCoaches] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const res = await axios.get(`${API_URL}/coaches`);
            setCoaches(res.data);
        } catch (error) {
            console.error('Failed to fetch coaches:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        if (password.length < 4) {
            setError('Password minimal 4 karakter');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                nama,
                phone,
                password,
                coachId: coachId || null
            });

            // Redirect to login with success message
            navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: '450px' }}>
                <div className="login-header">
                    <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Activity className="logo-icon" size={32} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span>PEVITA</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 400 }}>Puskesmas Bugangan</span>
                        </div>
                    </Link>
                    <h1>Daftar Akun Baru</h1>
                    <p>Bergabung dengan program fitness PEVITA</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#ef4444',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Masukkan nama lengkap"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Phone size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Nomor HP
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Contoh: 081234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Users size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Pilih Pelatih
                        </label>
                        <select
                            className="form-input"
                            value={coachId}
                            onChange={(e) => setCoachId(e.target.value)}
                        >
                            <option value="">-- Pilih Pelatih (Opsional) --</option>
                            {coaches.map(coach => (
                                <option key={coach.id} value={coach.id}>
                                    {coach.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Minimal 4 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Sudah punya akun?{' '}
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
