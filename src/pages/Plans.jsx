import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, formatDuration } from '../components/UI';
import { Plus, Server, Cloud, Shield, Users, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';


const ICONS = { server: Server, cloud: Cloud, shield: Shield, users: Users, book: BookOpen };

function AssignPlanModal({ open, onClose, plan }) {
  const { staff, assignPlanToStaff } = useApp();
  const [selected, setSelected] = useState([]);
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; });

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const submit = () => { assignPlanToStaff(plan.id, selected, dueDate); onClose(); setSelected([]); };

  return (
    <Modal open={open} onClose={onClose} title={`Assign: ${plan?.title}`}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={!selected.length}>Assign to {selected.length || ''} staff</button></>}>
      <div className="form-group">
        <label className="form-label">Select staff members</label>
        <div className="check-list">
          {staff.map(s => (
            <div key={s.id} className={`check-item ${selected.includes(s.id) ? 'selected' : ''}`} onClick={() => toggle(s.id)}>
              <input type="checkbox" checked={selected.includes(s.id)} readOnly />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">First module due by</label>
        <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <div className="form-hint">Subsequent modules will be spaced 2 weeks apart automatically.</div>
      </div>
    </Modal>
  );
}

function CreatePlanModal({ open, onClose }) {
  const { modules, addPlan } = useApp();
  const [form, setForm] = useState({ title: '', description: '', icon: 'server', moduleIds: [] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleMod = (id) => set('moduleIds', form.moduleIds.includes(id) ? form.moduleIds.filter(x => x !== id) : [...form.moduleIds, id]);
  const submit = () => { if (!form.title) return; addPlan(form); onClose(); setForm({ title: '', description: '', icon: 'server', moduleIds: [] }); };

  return (
    <Modal open={open} onClose={onClose} title="Create learning plan"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>Create plan</button></>}>
      <div className="form-group">
        <label className="form-label">Plan title</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. IT Support Pathway" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this plan for?" />
      </div>
      <div className="form-group">
        <label className="form-label">Select modules (in order)</label>
        <div className="check-list">
          {modules.map(m => (
            <div key={m.id} className={`check-item ${form.moduleIds.includes(m.id) ? 'selected' : ''}`} onClick={() => toggleMod(m.id)}>
              <input type="checkbox" checked={form.moduleIds.includes(m.id)} readOnly />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatDuration(m.duration)} · {getCat(m.category).label}</div>
              </div>
              {form.moduleIds.includes(m.id) && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--cyan)' }}>#{form.moduleIds.indexOf(m.id) + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function Plans() {
  const { plans, modules, assignments } = useApp();
  const [expanded, setExpanded] = useState(plans[0]?.id);
  const [assignModal, setAssignModal] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Learning plans</h1>
          <p className="page-sub">Technical development pathways for your team</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}><Plus size={15} /> New plan</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {plans.map(plan => {
          const Icon = ICONS[plan.icon] || BookOpen;
          const planModules = plan.moduleIds.map(id => modules.find(m => m.id === id)).filter(Boolean);
          const totalDuration = planModules.reduce((s, m) => s + m.duration, 0);
          const isOpen = expanded === plan.id;

          return (
            <div key={plan.id} className="card" style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : plan.id)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="var(--cyan)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{plan.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{planModules.length} modules</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatDuration(totalDuration)} total</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setAssignModal(plan); }}>
                    <Plus size={13} /> Assign
                  </button>
                  {isOpen ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                  {planModules.map((m, i) => {
                    const enrolled = assignments.filter(a => a.moduleId === m.id).length;
                    const cat = getCat(m.category);
                    return (
                      <div key={m.id} className="plan-step">
                        <div className="step-num">{i + 1}</div>
                        <div className="step-info">
                          <div className="step-title">{m.title}</div>
                          <div className="step-meta">{formatDuration(m.duration)} · {cat?.label} · {enrolled} enrolled</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                          Pass mark: {m.passMark}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {assignModal && <AssignPlanModal open={true} onClose={() => setAssignModal(null)} plan={assignModal} />}
      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
