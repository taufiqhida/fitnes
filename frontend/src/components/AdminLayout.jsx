import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, UserCheck, Video, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
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
                        to="/admin/dashboard"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/coaches"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <UserCheck size={20} />
                        Pelatih
                    </NavLink>
                    <NavLink
                        to="/admin/clients"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Users size={20} />
                        Client
                    </NavLink>
                    <NavLink
                        to="/admin/videos"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <Video size={20} />
                        Video
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {user?.nama?.charAt(0) || 'A'}
                        </div>
                        <div className="admin-info">
                            <div className="admin-name">{user?.nama || 'Administrator'}</div>
                            <div className="admin-role">{user?.role || 'Admin'}</div>
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
