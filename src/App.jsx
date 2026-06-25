import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Topbar, Sidebar } from './components/Layout';
import { Toast } from './components/UI';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Staff from './pages/Staff';
import Plans from './pages/Plans';
import { Reports, Certificates } from './pages/Reports';
import { MyPlan, Explore, MyCertificates } from './pages/Learner';

function AppShell() {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/my-plan" element={<MyPlan />} />
            <Route path="/explore" element={<Explore />} />
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
