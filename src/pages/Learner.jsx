import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar, Badge, formatDuration, formatDate } from '../components/UI';
import { CheckCircle, Clock, Play, Award, BookOpen, Search } from 'lucide-react';
import { CATEGORIES } from '../data/store';

// Learner view: uses the first non-admin staff member as the "logged-in" learner.
// Replace this with real auth (Supabase Auth) when you add login.
function useCurrentUser() {
  const { staff } = useApp();
  return staff.find(s => !s.is_admin) || staff[0] || null;
}

export function MyPlan() {
  const { assignments, modules, updateAssignment } = useApp();
  const currentUser = useCurrentUser();

  if (!currentUser) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading…</div>;

  const myAssignments = assignments
    .filter(a => a.staffId === currentUser.id)
    .map(a => ({ ...a, module: modules.find(m => m.id === a.moduleId) }))
    .filter(a => a.module)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const done = myAssignments.filter(a => a.status === 'completed').length;
  const pct  = myAssignments.length ? Math.round((done / myAssignments.length) * 100) : 0;

  const simulateProgress = async (a) => {
    const newProgress = Math.min(100, a.progress + 20);
    const newStatus   = newProgress >= 100 ? 'completed' : 'in_progress';
    const score       = newProgress >= 100 ? Math.floor(Math.random() * 20) + 78 : null;
    await updateAssignment(a.id, { progress: newProgress, status: newStatus, ...(score != null ? { score } : {}) });
  };

  return (
    <div>
      <div className="learner-banner">
        <div className="learner-av">{currentUser.avatar}</div>
        <div className="learner-info">
          <h2>{currentUser.name}</h2>
          <p>{currentUser.role} · {myAssignments.length} modules assigned</p>
        </div>
        <div className="learner-progress">
          <div className="big-pct">{pct}%</div>
          <div className="big-pct-label">overall complete</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Assigned</div><div className="stat-value">{myAssignments.length}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: 'var(--cyan)' }}>{done}</div></div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: myAssignments.filter(a => a.status !== 'completed' && new Date(a.dueDate) < new Date()).length > 0 ? 'var(--danger)' : 'var(--text)' }}>
            {myAssignments.filter(a => a.status !== 'completed' && new Date(a.dueDate) < new Date()).length}
          </div>
        </div>
      </div>

      <div className="section-title">My training plan</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {myAssignments.map(a => {
          const isOverdue = a.status !== 'completed' && new Date(a.dueDate) < new Date();
          const cat = CATEGORIES[a.module.category];
          return (
            <div key={a.id} className="plan-step" style={{ border: a.status === 'completed' ? '1px solid var(--cyan-border)' : isOverdue ? '1px solid rgba(255,107,107,0.3)' : '1px solid var(--border)' }}>
              <div className="step-num" style={a.status === 'completed' ? { background: 'var(--cyan)', color: 'var(--navy)', borderColor: 'var(--cyan)' } : {}}>
                {a.status === 'completed' ? <CheckCircle size={14} /> : <BookOpen size={13} />}
              </div>
              <div className="step-info">
                <div className="step-title">{a.module.title}</div>
                <div className="step-meta" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Badge category={a.module.category}>{cat?.label}</Badge>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{formatDuration(a.module.duration)}</span>
                  {a.score != null && <span style={{ color: 'var(--cyan)' }}>Score: {a.score}%</span>}
                </div>
                <ProgressBar value={a.progress} />
              </div>
              <div className="step-action" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 110 }}>
                {a.status === 'completed' ? (
                  <span style={{ fontSize: 12, color: 'var(--cyan)' }}>✓ Complete</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => simulateProgress(a)}>
                    <Play size={12} />{a.status === 'in_progress' ? 'Continue' : 'Start'}
                  </button>
                )}
                <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text-dim)' }}>
                  Due {formatDate(a.dueDate)}
                </span>
              </div>
            </div>
          );
        })}
        {myAssignments.length === 0 && <div className="empty-state"><p>No modules assigned yet. Check back with your manager.</p></div>}
      </div>
    </div>
  );
}

export function Explore() {
  const { modules, assignments, addAssignment } = useApp();
  const currentUser = useCurrentUser();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  if (!currentUser) return null;
  const myModuleIds = assignments.filter(a => a.staffId === currentUser.id).map(a => a.moduleId);

  const filtered = modules.filter(m => {
    const matchCat    = filter === 'ALL' || m.category === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const requestModule = async (m) => {
    if (myModuleIds.includes(m.id)) return;
    const due = new Date(); due.setDate(due.getDate() + 30);
    await addAssignment({
      staffId: currentUser.id, moduleId: m.id,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      status: 'not_started', progress: 0, score: null,
    });
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Explore modules</h1><p className="page-sub">Browse all available training</p></div>
      </div>
      <div className="search-row">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--text-dim)' }} />
          <input placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="filter-chips">
        <button className={`chip ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{v.label}</button>
        ))}
      </div>
      <div className="modules-grid">
        {filtered.map(m => {
          const assigned = myModuleIds.includes(m.id);
          const cat = CATEGORIES[m.category];
          return (
            <div key={m.id} className="module-card">
              <div style={{ marginBottom: 10 }}><Badge category={m.category}>{cat.label}</Badge></div>
              <div className="module-card-name">{m.title}</div>
              <div className="module-card-desc">{m.description}</div>
              <div className="module-card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{formatDuration(m.duration)}</span>
                <span>{m.lessons} lessons</span>
                <span>Pass: {m.pass_mark}%</span>
              </div>
              <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {assigned ? (
                  <span style={{ fontSize: 12, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={13} />In your plan</span>
                ) : (
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => requestModule(m)}>
                    <Play size={12} />Add to my plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyCertificates() {
  const { assignments, modules } = useApp();
  const currentUser = useCurrentUser();
  if (!currentUser) return null;
  const myDone = assignments.filter(a => a.staffId === currentUser.id && a.status === 'completed' && a.score != null);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My certificates</h1><p className="page-sub">{myDone.length} certificate{myDone.length !== 1 ? 's' : ''} earned</p></div>
      </div>
      {myDone.length === 0 && <div className="empty-state"><Award size={40} /><p>No certificates yet — complete a module to earn one.</p></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        {myDone.map(a => {
          const mod = modules.find(m => m.id === a.moduleId);
          if (!mod) return null;
          const valid = new Date(a.dueDate); valid.setFullYear(valid.getFullYear() + 1);
          return (
            <div key={a.id} className="card" style={{ border: '1px solid var(--cyan-border)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, background: 'var(--cyan-dim)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--cyan-border)', flexShrink: 0 }}>
                  <Award size={22} color="var(--cyan)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Score: <span style={{ color: 'var(--cyan)', fontWeight: 500 }}>{a.score}%</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Issued {formatDate(a.dueDate)} · Valid until {valid.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                <Award size={12} />Download PDF
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
