// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/public/LandingPage'; 
import LoginForm from './pages/admin/LoginForm';
import AdminLayout from './pages/admin/AdminLayout';
import InventoryDashboard from './pages/admin/InventoryDashboard';
import LedgerDashboard from './pages/admin/LedgerDashboard';
import WorkerDashboard from './pages/admin/WorkerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route mapped directly to our database-driven page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Authentication */}
        <Route path="/admin/login" element={<LoginForm />} />

        {/* Secure Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/inventory" replace />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory" element={<InventoryDashboard />} />
<Route path="stock" element={<WorkerDashboard />} /> {/* NEW ROUTE */}
         <Route path="ledger" element={<LedgerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}