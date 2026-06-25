import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  BarChart2, Award, Book, Compass, LogOut, UserCircle,
} from 'lucide-react';

export function Topbar() {
  const { view, setView, stats } = useApp();
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  // Use stored photo_url from profile — no Storage fetch needed
  const photoUrl = profile?.photo_url || null;

  const switchView = (v) => {
    setView(v);
    navigate(v === 'admin' ? '/dashboard' : '/my-plan');
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/outserve-logo.png" alt="Outserve" style={{ height: 26 }} />
        <div className="topbar-divider" />
        <span className="topbar-label">Learning Centre</span>
      </div>

      <div className="topbar-right">
        {stats.overdue > 0 && isAdmin && (
          <span style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.25)', padding: '4px 10px', borderRadius: 20 }}>
            {stats.overdue} overdue
          </span>
        )}

        {isAdmin && (
          <div className="view-toggle">
            <button className={`view-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => switchView('admin')}>Admin</button>
            <button className={`view-btn ${view === 'learner' ? 'active' : ''}`} onClick={() => switchView('learner')}>My learning</button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{profile?.name || 'User'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {profile?.is_admin ? 'Admin' : 'Staff'}
            </div>
          </div>

          {/* Clickable avatar → profile page */}
          <button
            onClick={() => navigate('/profile')}
            title="My profile"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={profile?.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan-border)' }} />
            ) : (
              <div className="avatar-btn" style={{ background: profile?.color ? profile.color + '22' : 'var(--cyan)', color: profile?.color || 'var(--navy)' }}>
                {profile?.avatar || '?'}
              </div>
            )}
          </button>

          <button
            onClick={signOut}
            title="Sign out"
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { view, stats } = useApp();
  const { isAdmin } = useAuth();

  const adminNav = [
    { to: '/profile',      label: 'My profile',      icon: UserCircle },
    { group: 'Overview' },
    { to: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/modules',      label: 'Modules',         icon: BookOpen },
    { group: 'People' },
    { to: '/staff',        label: 'Staff',           icon: Users },
    { to: '/plans',        label: 'Learning plans',  icon: ClipboardList },
    { group: 'Reports' },
    { to: '/reports',      label: 'Progress report', icon: BarChart2 },
    { to: '/certificates', label: 'Certificates',    icon: Award },
  ];

  const learnerNav = [
    { to: '/profile',         label: 'My profile',      icon: UserCircle },
    { group: 'My learning' },
    { to: '/my-plan',         label: 'My plan',         icon: Book },
    { to: '/explore',         label: 'Explore modules', icon: Compass },
    { group: 'Achievements' },
    { to: '/my-certificates', label: 'My certificates', icon: Award },
  ];

  const nav = (isAdmin && view === 'admin') ? adminNav : learnerNav;

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
