import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, ProgressRow, formatDate, formatDuration, Badge } from '../components/UI';
import { Download, Award } from 'lucide-react';
import { CATEGORIES } from '../data/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function Reports() {
  const { modules, staff, assignments } = useApp();

  const byModule = modules.map(m => {
    const ma = assignments.filter(a => a.moduleId === m.id);
    const done = ma.filter(a => a.status === 'completed').length;
    return { ...m, enrolled: ma.length, completed: done, rate: ma.length ? Math.round((done / ma.length) * 100) : 0 };
  }).sort((a, b) => b.enrolled - a.enrolled);

  const byCategory = Object.entries(CATEGORIES).map(([key, cat]) => {
    const catModules = modules.filter(m => m.category === key);
    const catAssign = assignments.filter(a => catModules.some(m => m.id === a.moduleId));
    const done = catAssign.filter(a => a.status === 'completed').length;
    return { name: cat.label, value: catAssign.length, completed: done, color: cat.color };
  });

  const completionRate = assignments.length ? Math.round((assignments.filter(a => a.status === 'completed').length / assignments.length) * 100) : 0;
  const avgScore = (() => { const s = assignments.filter(a => a.score != null); return s.length ? Math.round(s.reduce((t, a) => t + a.score, 0) / s.length) : null; })();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress report</h1>
          <p className="page-sub">{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-ghost"><Download size={15} /> Export CSV</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Completion rate</div>
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{completionRate}%</div>
          <div className="stat-sub">Across all assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total completions</div>
          <div className="stat-value">{assignments.filter(a => a.status === 'completed').length}</div>
          <div className="stat-sub">of {assignments.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. assessment score</div>
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{avgScore !== null ? `${avgScore}%` : '—'}</div>
          <div className="stat-sub">On completed modules</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 600, fontSize: 14 }}>Completions by module</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byModule.slice(0, 7)} barSize={24}>
              <XAxis dataKey="title" tick={false} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--navy-light)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }} formatter={(v) => [v, '']} labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''} />
              <Bar dataKey="enrolled" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]} name="Enrolled" />
              <Bar dataKey="completed" fill="var(--cyan)" radius={[4,4,0,0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span style={{ fontWeight: 600, fontSize: 14 }}>By category</span></div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--navy-light)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {byCategory.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Completion by module</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Module</th><th>Category</th><th>Enrolled</th><th>Completed</th><th>Completion rate</th></tr></thead>
          <tbody>
            {byModule.map(m => (
              <tr key={m.id}>
                <td style={{ color: 'var(--text)', fontWeight: 500 }}>{m.title}</td>
                <td><Badge category={m.category}>{CATEGORIES[m.category]?.label}</Badge></td>
                <td>{m.enrolled}</td>
                <td>{m.completed}</td>
                <td style={{ width: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${m.rate}%`, height: '100%', background: m.rate >= 80 ? 'var(--cyan)' : m.rate >= 50 ? 'var(--warning)' : 'var(--danger)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, minWidth: 34, color: 'var(--text-muted)' }}>{m.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Certificates() {
  const { assignments, staff, modules } = useApp();
  const completed = assignments.filter(a => a.status === 'completed' && a.score != null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-sub">{completed.length} certificates issued</p>
        </div>
        <button className="btn btn-ghost"><Download size={15} /> Export all</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Staff member</th><th>Module</th><th>Score</th><th>Issued</th><th>Valid until</th><th></th></tr></thead>
          <tbody>
            {completed.map(a => {
              const member = staff.find(s => s.id === a.staffId);
              const mod = modules.find(m => m.id === a.moduleId);
              if (!member || !mod) return null;
              const issued = new Date(a.dueDate);
              const valid = new Date(issued); valid.setFullYear(valid.getFullYear() + 1);
              return (
                <tr key={a.id}>
                  <td><div className="staff-name-cell"><Avatar person={member} /><div><strong>{member.name}</strong><span>{member.role}</span></div></div></td>
                  <td>{mod.title}</td>
                  <td><span style={{ color: 'var(--cyan)', fontWeight: 500 }}>{a.score}%</span></td>
                  <td>{formatDate(a.dueDate)}</td>
                  <td>{valid.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><button className="btn btn-ghost btn-sm"><Download size={12} /> PDF</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {completed.length === 0 && <div className="empty-state"><p>No certificates issued yet.</p></div>}
    </div>
  );
}


