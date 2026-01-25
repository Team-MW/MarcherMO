import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import ClientHome from './pages/ClientHome';
import ClientStatus from './pages/ClientStatus';
import ButcherAdmin from './pages/ButcherAdmin';
import DisplayQR from './pages/DisplayQR';
import './index.css';

function App() {
  return (
    <QueueProvider>
      <Router>
        <Routes>
          {/* QR Display */}
          <Route path="/qr" element={<DisplayQR />} />

          {/* Client Routes */}
          <Route path="/" element={<ClientHome />} />
          <Route path="/status" element={<ClientStatus />} />

          {/* Butcher Routes */}
          <Route path="/admin" element={<ButcherAdmin />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueueProvider>
  );
}

export default App;
