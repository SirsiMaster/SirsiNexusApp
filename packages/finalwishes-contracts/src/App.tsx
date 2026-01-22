// @ts-nocheck
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
        <Route path="/" element={<LandingPage /> as any} />

        {/* Service Agreement Workflow */}
        <Route path="/partnership" element={<Navigate to="/partnership/finalwishes" replace /> as any} />
        <Route path="/partnership/:projectId" element={<AgreementWorkflow /> as any} />
        <Route path="/partnership/:projectId/payment/success" element={<AgreementWorkflow /> as any} />

        {/* Vault Dashboard */}
        <Route path="/vault" element={<VaultDashboard /> as any} />

        {/* Admin Studio */}
        <Route path="/admin" element={<AdminDashboard /> as any} />

        {/* Catch-all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace /> as any} />
      </Routes>
    </Router>
  );
}

export default App;
