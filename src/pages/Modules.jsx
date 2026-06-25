import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, formatDuration } from '../components/UI';
import { Plus, Clock, Users, Search, Edit2, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../data/store';

function CreateModuleModal({ open, onClose }) {
  const { addModule } = useApp();
  const [form, setForm] = useState({ title: '', category: 'IT', duration: 60, description: '', lessons: 5, passMark: 80 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.title) return;
    addModule(form);
    onClose();
    setForm({ title: '', category: 'IT', duration: 60, description: '', lessons: 5, passMark: 80 });
  };
  return (
    <Modal open={open} onClose={onClose} title="Create training module"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>Create module</button></>}>
      <div className="form-group">
        <label className="form-label">Module title</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cyber Security Essentials" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Duration (minutes)</label>
          <input type="number" className="form-input" value={form.duration} onChange={e => set('duration', +e.target.value)} min={15} step={15} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What will learners gain from this module?" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Number of lessons</label>
          <input type="number" className="form-input" value={form.lessons} onChange={e => set('lessons', +e.target.value)} min={1} />
        </div>
        <div className="form-group">
          <label className="form-label">Pass mark (%)</label>
          <input type="number" className="form-input" value={form.passMark} onChange={e => set('passMark', +e.target.value)} min={50} max={100} />
        </div>
      </div>
    </Modal>
  );
}

export default function Modules() {
  const { modules, assignments, deleteModule } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  const cats = [{ key: 'ALL', label: 'All modules' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ key: k, label: v.label }))];

  const filtered = modules.filter(m => {
    const matchCat = filter === 'ALL' || m.category === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Training modules</h1>
          <p className="page-sub">{modules.length} modules across {Object.keys(CATEGORIES).length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={15} /> New module</button>
      </div>

      <div className="search-row">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--text-dim)' }} />
          <input placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="filter-chips">
        {cats.map(c => (
          <button key={c.key} className={`chip ${filter === c.key ? 'active' : ''}`} onClick={() => setFilter(c.key)}>{c.label}</button>
        ))}
      </div>

      <div className="modules-grid">
        {filtered.map(m => {
          const enrolled = assignments.filter(a => a.moduleId === m.id).length;
          const cat = CATEGORIES[m.category];
          return (
            <div key={m.id} className="module-card">
              <div style={{ marginBottom: 10 }}>
                <Badge category={m.category}>{cat.label}</Badge>
              </div>
              <div className="module-card-name">{m.title}</div>
              <div className="module-card-desc">{m.description}</div>
              <div className="module-card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDuration(m.duration)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {enrolled} enrolled</span>
                <span>{m.lessons} lessons</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteModule(m.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><p>No modules match your search.</p></div>
      )}

      <CreateModuleModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
