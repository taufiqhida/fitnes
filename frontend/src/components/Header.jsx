import { Link } from 'react-router-dom';
import { Activity, Phone, MessageCircle } from 'lucide-react';

export default function Header() {
    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <Activity className="logo-icon" size={32} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span>PEVITA</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 400 }}>Puskesmas Bugangan</span>
                    </div>
                </Link>
                <div className="header-buttons">
                    <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                    >
                        <Phone size={18} />
                        Hubungi Admin
                    </a>
                    <Link to="/login" className="btn btn-primary">
                        Masuk
                    </Link>
                </div>
            </div>
        </header>
    );
}
