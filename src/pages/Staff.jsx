import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, StatusBadge, ProgressBar, Modal } from '../components/UI';
import AssignModal from '../components/AssignModal';
import { Plus, Search, UserPlus } from 'lucide-react';

const COLORS = ['#00D4B8', '#9090FF', '#FFB432', '#FF7070', '#70D070', '#FF9F50', '#50C8FF', '#FF6EB4'];

function AddStaffModal({ open, onClose }) {
  const { addStaff } = useApp();
  const [form, setForm] = useState({ name: '', role: '', dept: 'Technology', email: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name) return;
    const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    addStaff({ ...form, avatar: initials, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    onClose();
    setForm({ name: '', role: '', dept: 'Technology', email: '' });
  };
  return (
    <Modal open={open} onClose={onClose} title="Add staff member"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>Add member</button></>}>
      <div className="form-group">
        <label className="form-label">Full name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jane Smith" />
      </div>
      <div className="form-group">
        <label className="form-label">Job title</label>
        <input className="form-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. IT Support Engineer" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="form-select" value={form.dept} onChange={e => set('dept', e.target.value)}>
            <option>Technology</option>
            <option>Operations</option>
            <option>Finance</option>
            <option>HR</option>
            <option>Sales</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="j.smith@outserve.co.uk" />
        </div>
      </div>
    </Modal>
  );
}

export default function Staff() {
  const { staff, assignments, modules } = useApp();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStaffId, setAssignStaffId] = useState(null);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  const openAssign = (staffId) => { setAssignStaffId(staffId); setAssignOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-sub">{staff.length} team members</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => setAddOpen(true)}><UserPlus size={15} /> Add staff</button>
          <button className="btn btn-primary" onClick={() => { setAssignStaffId(null); setAssignOpen(true); }}><Plus size={15} /> Assign module</button>
        </div>
      </div>

      <div className="search-row">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--text-dim)' }} />
          <input placeholder="Search by name, role or department…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Department</th>
              <th>Modules assigned</th>
              <th>Completed</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const sa = assignments.filter(a => a.staffId === s.id);
              const done = sa.filter(a => a.status === 'completed').length;
              const pct = sa.length ? Math.round((done / sa.length) * 100) : 0;
              const overdue = sa.some(a => a.status !== 'completed' && new Date(a.dueDate) < new Date());
              const allDone = sa.length > 0 && done === sa.length;
              return (
                <tr key={s.id}>
                  <td>
                    <div className="staff-name-cell">
                      <Avatar person={s} />
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.role}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.dept}</td>
                  <td>{sa.length}</td>
                  <td>{done} / {sa.length}</td>
                  <td style={{ width: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={pct} style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 30 }}>{pct}%</span>
                    </div>
                  </td>
                  <td>
                    {sa.length === 0 && <span className="badge badge-not_started">No modules</span>}
                    {sa.length > 0 && overdue && <span className="badge badge-overdue">Overdue</span>}
                    {sa.length > 0 && !overdue && allDone && <span className="badge badge-completed">All complete</span>}
                    {sa.length > 0 && !overdue && !allDone && <span className="badge badge-in_progress">In progress</span>}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openAssign(s.id)}>
                      <Plus size={12} /> Assign
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} prefillStaffId={assignStaffId} />
    </div>
  );
}
