import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, Calendar, Video, MessageCircle, LogOut, Apple } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoachLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <Activity className="logo-icon" size={28} />
                        <span>PEVITA</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/coach/dashboard"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/coach/clients"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Users size={20} />
                        Client Saya
                    </NavLink>
                    <NavLink
                        to="/coach/schedule"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Calendar size={20} />
                        Jadwal Latihan
                    </NavLink>
                    <NavLink
                        to="/coach/videos"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Video size={20} />
                        Video Latihan
                    </NavLink>
                    <NavLink
                        to="/coach/chat"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <MessageCircle size={20} />
                        Konsultasi
                    </NavLink>
                    <NavLink
                        to="/coach/food-recommendations"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Apple size={20} />
                        Saran Makanan
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {user?.nama?.charAt(0) || 'C'}
                        </div>
                        <div className="admin-info">
                            <div className="admin-name">{user?.nama || 'Coach'}</div>
                            <div className="admin-role">Pelatih</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}
