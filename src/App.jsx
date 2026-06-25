import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Topbar, Sidebar } from './components/Layout';
import { Toast } from './components/UI';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Staff from './pages/Staff';
import Plans from './pages/Plans';
import { Reports, Certificates } from './pages/Reports';
import { MyPlan, Explore, MyCertificates } from './pages/Learner';

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
      <img src="/outserve-logo.png" alt="Outserve" style={{ height: 32, opacity: 0.9 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function AppShell() {
  const { loading } = useApp();
  if (loading) return <LoadingScreen />;
  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/modules"         element={<Modules />} />
            <Route path="/staff"           element={<Staff />} />
            <Route path="/plans"           element={<Plans />} />
            <Route path="/reports"         element={<Reports />} />
            <Route path="/certificates"    element={<Certificates />} />
            <Route path="/my-plan"         element={<MyPlan />} />
            <Route path="/explore"         element={<Explore />} />
            <Route path="/my-certificates" element={<MyCertificates />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
