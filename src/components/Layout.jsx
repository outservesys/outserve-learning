import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  BarChart2, Award, Book, Compass, LogOut,
} from 'lucide-react';

export function Topbar() {
  const { view, setView, stats } = useApp();
  const navigate = useNavigate();

  const switchView = (v) => {
    setView(v);
    navigate(v === 'admin' ? '/dashboard' : '/my-plan');
  };

  return (
    <div className="topbar">
      <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/outserve-logo.png" alt="Outserve" style={{ height: 26 }} />
        <div className="topbar-divider" />
        <span className="topbar-label">Learning Centre</span>
      </div>
      <div className="topbar-right">
        {stats.overdue > 0 && (
          <span style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', padding: '4px 10px', borderRadius: 20 }}>
            {stats.overdue} overdue
          </span>
        )}
        <div className="view-toggle">
          <button className={`view-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => switchView('admin')}>Admin</button>
          <button className={`view-btn ${view === 'learner' ? 'active' : ''}`} onClick={() => switchView('learner')}>My learning</button>
        </div>
        <button className="avatar-btn">JT</button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { view, stats } = useApp();

  const adminNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/modules', label: 'Modules', icon: BookOpen },
    { group: 'People' },
    { to: '/staff', label: 'Staff', icon: Users },
    { to: '/plans', label: 'Learning plans', icon: ClipboardList },
    { group: 'Reports' },
    { to: '/reports', label: 'Progress report', icon: BarChart2 },
    { to: '/certificates', label: 'Certificates', icon: Award },
  ];

  const learnerNav = [
    { group: 'My learning' },
    { to: '/my-plan', label: 'My plan', icon: Book },
    { to: '/explore', label: 'Explore modules', icon: Compass },
    { group: 'Achievements' },
    { to: '/my-certificates', label: 'My certificates', icon: Award },
  ];

  const nav = view === 'admin' ? adminNav : learnerNav;

  return (
    <div className="sidebar">
      {nav.map((item, i) => {
        if (item.group) return <div key={i} className="nav-group-label">{item.group}</div>;
        const Icon = item.icon;
        const badge = item.to === '/dashboard' && stats.overdue > 0 ? stats.overdue : null;
        return (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            {item.label}
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        );
      })}
    </div>
  );
}
