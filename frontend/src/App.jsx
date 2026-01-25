import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Pelatih from './pages/admin/Pelatih';
import AdminClient from './pages/admin/Client';
import AdminLayout from './components/AdminLayout';
import AdminVideos from './pages/admin/Videos';

// Coach pages
import CoachLayout from './components/CoachLayout';
import CoachDashboard from './pages/coach/Dashboard';
import CoachClients from './pages/coach/Clients';
import ClientDetail from './pages/coach/ClientDetail';
import Schedule from './pages/coach/Schedule';
import Videos from './pages/coach/Videos';
import Chat from './pages/coach/Chat';
import CoachFoodRecommendations from './pages/coach/FoodRecommendations';

// Client pages
import ClientLayout from './components/ClientLayout';
import ClientDashboard from './pages/client/Dashboard';
import InputIMT from './pages/client/InputIMT';
import ClientSchedule from './pages/client/Schedule';
import Recommendations from './pages/client/Recommendations';
import ClientVideos from './pages/client/Videos';
import Progress from './pages/client/Progress';
import ClientChat from './pages/client/Chat';
import ClientFoodRecommendations from './pages/client/FoodRecommendations';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'COACH') return <Navigate to="/coach/dashboard" replace />;
    if (user.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="coaches" element={<Pelatih />} />
            <Route path="clients" element={<AdminClient />} />
            <Route path="videos" element={<AdminVideos />} />
          </Route>

          {/* Coach Routes */}
          <Route path="/coach" element={
            <ProtectedRoute allowedRoles={['COACH']}>
              <CoachLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/coach/dashboard" replace />} />
            <Route path="dashboard" element={<CoachDashboard />} />
            <Route path="clients" element={<CoachClients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="videos" element={<Videos />} />
            <Route path="chat" element={<Chat />} />
            <Route path="food-recommendations" element={<CoachFoodRecommendations />} />
          </Route>

          {/* Client Routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="imt" element={<InputIMT />} />
            <Route path="schedule" element={<ClientSchedule />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="videos" element={<ClientVideos />} />
            <Route path="progress" element={<Progress />} />
            <Route path="chat" element={<ClientChat />} />
            <Route path="food-recommendations" element={<ClientFoodRecommendations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
