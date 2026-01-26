import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import { LanguageProvider } from './context/LanguageContext';
import ClientHome from './pages/ClientHome';
import ClientStatus from './pages/ClientStatus';
import ButcherAdmin from './pages/ButcherAdmin';
import DisplayQR from './pages/DisplayQR';
import Analytics from './pages/Analytics';
import AdminLogin from './pages/AdminLogin';
import Sitemap from './pages/Sitemap';
import ScoreDisplay from './pages/ScoreDisplay';
import { useState } from 'react';
import './index.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('admin_auth') === 'true');

  const handleAdminLogin = () => setIsAdmin(true);

  return (
    <LanguageProvider>
      <QueueProvider>
        <Router>
          <Routes>
            {/* Dashboard Central */}
            <Route path="/vue" element={<Sitemap />} />
            <Route path="/score" element={<ScoreDisplay />} />

            {/* QR & Stats */}
            <Route path="/qr" element={<DisplayQR />} />
            <Route
              path="/analytics"
              element={isAdmin ? <Analytics /> : <AdminLogin onLogin={handleAdminLogin} />}
            />

            {/* Client Routes */}
            <Route path="/" element={<ClientHome />} />
            <Route path="/status" element={<ClientStatus />} />

            {/* Butcher Routes */}
            <Route
              path="/admin"
              element={isAdmin ? <ButcherAdmin /> : <AdminLogin onLogin={handleAdminLogin} />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </QueueProvider>
    </LanguageProvider>
  );
}

export default App;
