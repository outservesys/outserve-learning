import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Topbar, Sidebar } from './components/Layout';
import { Toast } from './components/UI';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Staff from './pages/Staff';
import Plans from './pages/Plans';
import { Reports, Certificates } from './pages/Reports';
import { MyPlan, Explore, MyCertificates } from './pages/Learner';

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
      <img src="/outserve-logo.png" alt="Outserve" style={{ height: 32, opacity: 0.9 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// Redirect staff-only users away from admin routes
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/my-plan" replace />;
}

function AppShell() {
  const { loading } = useApp();
  const { authLoading, session, isAdmin } = useAuth();

  if (authLoading || loading) return <Spinner />;
  if (!session) return <Login />;

  const defaultPath = isAdmin ? '/dashboard' : '/my-plan';

  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />

            {/* Admin-only routes */}
            <Route path="/dashboard"    element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/modules"      element={<AdminRoute><Modules /></AdminRoute>} />
            <Route path="/staff"        element={<AdminRoute><Staff /></AdminRoute>} />
            <Route path="/plans"        element={<AdminRoute><Plans /></AdminRoute>} />
            <Route path="/reports"      element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="/certificates" element={<AdminRoute><Certificates /></AdminRoute>} />

            {/* All authenticated users */}
            <Route path="/my-plan"          element={<MyPlan />} />
            <Route path="/explore"          element={<Explore />} />
            <Route path="/my-certificates"  element={<MyCertificates />} />

            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
