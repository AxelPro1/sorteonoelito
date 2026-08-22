import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DepositsPage from './pages/DepositsPage.jsx';
import WinnerPage from './pages/WinnerPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Formulario público */}
      <Route path="/" element={<LandingPage />} />

      {/* Login del admin */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Panel de administración protegido */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="depositos" element={<DepositsPage />} />
          <Route path="sorteo" element={<WinnerPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
