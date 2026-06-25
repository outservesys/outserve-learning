import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, StatusBadge, ProgressBar, Modal, formatDate, formatDuration } from '../components/UI';
import { Plus, TrendingUp, Users, BookOpen, CheckSquare, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AssignModal from '../components/AssignModal';

export default function Dashboard() {
  const { modules, staff, assignments, plans, stats } = useApp();
  const [assignOpen, setAssignOpen] = useState(false);

  const recent = [...assignments]
    .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate))
    .slice(0, 8);

  const chartData = modules.slice(0, 6).map(m => {
    const modAssign = assignments.filter(a => a.moduleId === m.id);
    const done = modAssign.filter(a => a.status === 'completed').length;
    return { name: m.title.split(' ').slice(0, 2).join(' '), completed: done, total: modAssign.length, rate: modAssign.length ? Math.round((done / modAssign.length) * 100) : 0 };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview — {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setAssignOpen(true)}>
            <Plus size={15} /> Assign module
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Staff enrolled</div>
          <div className="stat-value">{stats.totalStaff}</div>
          <div className="stat-sub positive" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={11} /> Active learners</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Modules</div>
          <div className="stat-value">{stats.totalModules}</div>
          <div className="stat-sub">{plans.length} learning plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completions</div>
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{stats.completions}</div>
          <div className="stat-sub positive">{stats.completionRate}% completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: stats.overdue > 0 ? 'var(--danger)' : 'var(--text)' }}>{stats.overdue}</div>
          <div className="stat-sub" style={{ color: stats.overdue > 0 ? 'var(--danger)' : '' }}>
            {stats.overdue > 0 ? 'Action needed' : 'All on track'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Completion by module</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(237,242,247,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--navy-light)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }}
                formatter={(v, n) => [n === 'completed' ? `${v} completed` : `${v} total`, '']}
                labelStyle={{ color: 'var(--text-muted)' }}
              />
              <Bar dataKey="total" fill="rgba(255,255,255,0.06)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Staff at a glance</span>
          </div>
          {staff.slice(0, 5).map(s => {
            const sa = assignments.filter(a => a.staffId === s.id);
            const done = sa.filter(a => a.status === 'completed').length;
            const pct = sa.length ? Math.round((done / sa.length) * 100) : 0;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar person={s} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <ProgressBar value={pct} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 28 }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-title" style={{ marginBottom: 14 }}>Recent assignments</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Module</th>
              <th>Assigned</th>
              <th>Due</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(a => {
              const member = staff.find(s => s.id === a.staffId);
              const mod = modules.find(m => m.id === a.moduleId);
              if (!member || !mod) return null;
              return (
                <tr key={a.id}>
                  <td>
                    <div className="staff-name-cell">
                      <Avatar person={member} />
                      <div><strong>{member.name}</strong><span>{member.role}</span></div>
                    </div>
                  </td>
                  <td>{mod.title}</td>
                  <td>{formatDate(a.assignedDate)}</td>
                  <td style={{ color: new Date(a.dueDate) < new Date() && a.status !== 'completed' ? 'var(--danger)' : '' }}>{formatDate(a.dueDate)}</td>
                  <td><StatusBadge assignment={a} /></td>
                  <td style={{ width: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={a.progress} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 28 }}>{a.progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} />
    </div>
  );
}
