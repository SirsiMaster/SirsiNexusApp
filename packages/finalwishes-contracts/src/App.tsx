import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AgreementWorkflow } from './components/workflow/AgreementWorkflow';
import { LandingPage } from './components/vault/LandingPage';
import { VaultDashboard } from './components/vault/VaultDashboard';
import { AdminDashboard } from './components/vault/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Partnership Agreement Workflow */}
        <Route path="/partnership" element={<AgreementWorkflow />} />
        <Route path="/payment/success" element={<AgreementWorkflow />} />

        {/* Vault Dashboard */}
        <Route path="/vault" element={<VaultDashboard />} />

        {/* Admin Studio */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
