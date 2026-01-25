import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loggedInUser = await login(phone, password);
            // Redirect based on role
            if (loggedInUser.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (loggedInUser.role === 'COACH') {
                navigate('/coach/dashboard');
            } else if (loggedInUser.role === 'CLIENT') {
                navigate('/client/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Periksa kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Activity className="logo-icon" size={32} />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span>PEVITA</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 400 }}>Puskesmas Bugangan</span>
                        </div>
                    </Link>
                    <h1>Selamat Datang</h1>
                    <p>Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                <div className="demo-credentials">
                    <p>Demo Credentials:</p>
                    <div>
                        Admin: <code>admin</code> / <code>admin</code>
                    </div>
                    <div>
                        Pelatih: <code>pelatih</code> / <code>pelatih</code>
                    </div>
                    <div>
                        Client: <code>client</code> / <code>client</code>
                    </div>
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
                            <Phone size={16} style={{ marginRight: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                            Nomor HP / Username
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Masukkan nomor HP atau username"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Belum punya akun?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
