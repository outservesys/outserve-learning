import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, formatDuration } from '../components/UI';
import { Plus, Clock, Users, Search, Edit2, Trash2, Tag, Check, X } from 'lucide-react';

const PALETTE = [
  '#00D4B8','#9090FF','#FFB432','#FF7070','#70D070',
  '#FF9F50','#50C8FF','#FF6EB4','#A0C4FF','#B5EAD7',
];

// ── Badge using dynamic category ──────────────────────────────
function CatBadge({ catKey, categories }) {
  const cat = categories.find(c => c.key === catKey);
  if (!cat) return <span className="badge badge-not_started">{catKey}</span>;
  return (
    <span className="badge" style={{ background: cat.color + '22', color: cat.color }}>
      {cat.label}
    </span>
  );
}

const LEVEL_STYLES = {
  Beginner:     { color: '#70D070', bg: 'rgba(112,208,112,0.14)' },
  Intermediate: { color: '#FFB432', bg: 'rgba(255,180,50,0.14)'  },
  Expert:       { color: '#FF7070', bg: 'rgba(255,112,112,0.14)' },
};

function LevelBadge({ level }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES.Beginner;
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{level}</span>;
}

// ── Manage Categories Modal ───────────────────────────────────
function ManageCategoriesModal({ open, onClose }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newLabel, setNewLabel]   = useState('');
  const [newColor, setNewColor]   = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    await addCategory({ label: newLabel.trim(), color: newColor });
    setNewLabel('');
    setNewColor(PALETTE[0]);
  };

  const startEdit = (cat) => { setEditingId(cat.id); setEditLabel(cat.label); setEditColor(cat.color); };
  const saveEdit  = async () => { await updateCategory(editingId, { label: editLabel, color: editColor }); setEditingId(null); };
  const cancelEdit = () => setEditingId(null);

  return (
    <Modal open={open} onClose={onClose} title="Manage categories"
      footer={<button className="btn btn-ghost" onClick={onClose}>Done</button>}>

      {/* Existing categories */}
      <div style={{ marginBottom: 24 }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Current categories</div>
        {categories.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No categories yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
              {editingId === cat.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 140 }}>
                    {PALETTE.map(col => (
                      <button
                        key={col}
                        onClick={() => setEditColor(col)}
                        style={{ width: 20, height: 20, borderRadius: '50%', background: col, border: editColor === col ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  <button className="btn btn-primary btn-sm btn-icon" onClick={saveEdit}><Check size={13} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={cancelEdit}><X size={13} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', marginRight: 8 }}>{cat.key}</span>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(cat)} title="Edit"><Edit2 size={13} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteCategory(cat.id)} title="Delete"><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add new */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div className="form-label" style={{ marginBottom: 10 }}>Add new category</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: 'column' }}>
          <input
            className="form-input"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="e.g. Leadership & Management"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ width: '100%' }}
          />
          <div>
            <div className="form-label" style={{ marginBottom: 6 }}>Colour</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PALETTE.map(col => (
                <button
                  key={col}
                  onClick={() => setNewColor(col)}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: col, border: newColor === col ? '2px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!newLabel.trim()}>
              <Plus size={14} /> Add category
            </button>
            {newLabel && (
              <span className="badge" style={{ background: newColor + '22', color: newColor }}>{newLabel}</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Create / Edit Module Modal ────────────────────────────────
function ModuleModal({ open, onClose, existing }) {
  const { addModule, updateModule, categories } = useApp();
  const defaultCat = categories[0]?.key || '';
  const [form, setForm] = useState(
    existing
      ? { title: existing.title, category: existing.category, duration: existing.duration, description: existing.description, lessons: existing.lessons, passMark: existing.pass_mark ?? existing.passMark ?? 80, level: existing.level || 'Beginner', moduleCode: existing.module_code || '' }
      : { title: '', category: defaultCat, duration: 60, description: '', lessons: 5, passMark: 80, level: 'Beginner', moduleCode: '' }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title) return;
    if (existing) {
      await updateModule(existing.id, form);
    } else {
      await addModule(form);
    }
    onClose();
    if (!existing) setForm({ title: '', category: defaultCat, duration: 60, description: '', lessons: 5, passMark: 80, level: 'Beginner', moduleCode: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit module' : 'Create training module'}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>{existing ? 'Save changes' : 'Create module'}</button></>}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Module code</label>
          <input className="form-input" value={form.moduleCode} onChange={e => set('moduleCode', e.target.value.toUpperCase())} placeholder="e.g. IT-001" style={{ fontFamily: 'monospace' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Module title</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cyber Security Essentials" autoFocus />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            {categories.length === 0 && <option value="">No categories yet</option>}
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
      <div className="form-group">
        <label className="form-label">Level</label>
        <select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function Modules() {
  const { modules, assignments, deleteModule, categories } = useApp();
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [catOpen, setCatOpen]       = useState(false);

  const filtered = modules.filter(m => {
    const matchCat    = filter === 'ALL' || m.category === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                        m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Training modules</h1>
          <p className="page-sub">{modules.length} modules across {categories.length} categories</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => setCatOpen(true)}>
            <Tag size={15} /> Manage categories
          </button>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> New module
          </button>
        </div>
      </div>

      <div className="search-row">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--text-dim)' }} />
          <input placeholder="Search modules…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-chips">
        <button className={`chip ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All modules</button>
        {categories.map(c => (
          <button
            key={c.key}
            className={`chip ${filter === c.key ? 'active' : ''}`}
            onClick={() => setFilter(c.key)}
            style={filter === c.key ? { background: c.color + '22', borderColor: c.color + '66', color: c.color } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="modules-grid">
        {filtered.map(m => {
          const enrolled = assignments.filter(a => a.moduleId === m.id).length;
          return (
            <div key={m.id} className="module-card">
              <div style={{ marginBottom: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <CatBadge catKey={m.category} categories={categories} />
                {m.level && <LevelBadge level={m.level} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <div className="module-card-name" style={{ marginBottom: 0 }}>{m.title}</div>
              </div>
              {m.module_code && <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-dim)', marginBottom: 6 }}>{m.module_code}</div>}
              <div className="module-card-desc">{m.description}</div>
              <div className="module-card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDuration(m.duration)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {enrolled} enrolled</span>
                <span>{m.lessons} lessons</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setEditTarget(m)}>
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

      {filtered.length === 0 && <div className="empty-state"><p>No modules match your search.</p></div>}

      <ModuleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editTarget && <ModuleModal open={true} onClose={() => setEditTarget(null)} existing={editTarget} />}
      <ManageCategoriesModal open={catOpen} onClose={() => setCatOpen(false)} />
    </div>
  );
}
