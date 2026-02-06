// @ts-nocheck
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AgreementWorkflow } from './components/workflow/AgreementWorkflow';
import { LandingPage } from './components/vault/LandingPage';
import { VaultDashboard } from './components/vault/VaultDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Gateway / Vault Entry */}
          <Route path="/" element={<LandingPage /> as any} />
          <Route path="/login" element={<Login /> as any} />
          <Route path="/landing" element={<Navigate to="/" replace /> as any} />

          {/* Service Agreement Workflow - All Gated */}
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Navigate to="/contracts/finalwishes" replace />
            </ProtectedRoute>
          } />
          <Route path="/contracts/:projectId" element={
            <ProtectedRoute>
              <AgreementWorkflow />
            </ProtectedRoute>
          } />
          <Route path="/contracts/:projectId/payment/success" element={
            <ProtectedRoute>
              <AgreementWorkflow />
            </ProtectedRoute>
          } />

          {/* Backward-compat: redirect legacy /partnership URLs */}
          <Route path="/partnership" element={<Navigate to="/contracts" replace />} />
          <Route path="/partnership/*" element={<Navigate to="/contracts/finalwishes" replace />} />

          {/* New Hierarchical Vault Routes - All Gated */}
          {/* structure: sign.sirsi.ai/vault/:user/:type/:entity/:docName */}
          <Route path="/vault" element={
            <ProtectedRoute>
              <VaultDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vault/:userId" element={
            <ProtectedRoute>
              <VaultDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vault/:userId/:category" element={
            <ProtectedRoute>
              <VaultDashboard />
            </ProtectedRoute>
          } />

          {/* Specific Document Review Routes (Hierarchical) */}
          <Route path="/vault/:userId/contracts/:entityId/:docId" element={
            <ProtectedRoute>
              <AgreementWorkflow />
            </ProtectedRoute>
          } />

          {/* Fallback for other vault entities */}
          <Route path="/vault/:userId/:category/:entityId" element={
            <ProtectedRoute>
              <VaultDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vault/:userId/:category/:entityId/:docId" element={
            <ProtectedRoute>
              <VaultDashboard />
            </ProtectedRoute>
          } />


          {/* Catch-all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace /> as any} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

