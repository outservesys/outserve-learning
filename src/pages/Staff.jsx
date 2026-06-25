import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Avatar, ProgressBar, Modal } from '../components/UI';
import AssignModal from '../components/AssignModal';
import CreateAccountModal from '../components/CreateAccountModal';
import { Plus, Search, UserPlus, Trash2, ShieldCheck, User } from 'lucide-react';

function DeleteStaffModal({ member, onClose }) {
  const { deleteStaff, assignments } = useApp();
  const assignmentCount = assignments.filter(a => a.staffId === member?.id).length;
  const submit = async () => { await deleteStaff(member.id); onClose(); };
  return (
    <Modal open={!!member} onClose={onClose} title="Remove staff member"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={submit}>Remove staff member</button></>}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
        Are you sure you want to remove <strong style={{ color: 'var(--text)' }}>{member?.name}</strong>? This cannot be undone.
      </p>
      {assignmentCount > 0 && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>
          This will also delete {assignmentCount} training assignment{assignmentCount !== 1 ? 's' : ''} for this staff member.
        </div>
      )}
    </Modal>
  );
}

export default function Staff() {
  const { staff, assignments } = useApp();
  const { isAdmin } = useAuth();
  const [search, setSearch]           = useState('');
  const [createOpen, setCreateOpen]   = useState(false);
  const [assignOpen, setAssignOpen]   = useState(false);
  const [assignStaffId, setAssignStaffId] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [roleFilter, setRoleFilter]   = useState('all'); // 'all' | 'admin' | 'staff'

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || (roleFilter === 'admin' ? s.is_admin : !s.is_admin);
    return matchSearch && matchRole;
  });

  const openAssign = (staffId) => { setAssignStaffId(staffId); setAssignOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-sub">{staff.length} team members</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-ghost" onClick={() => setCreateOpen(true)}>
              <UserPlus size={15} /> Create account
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setAssignStaffId(null); setAssignOpen(true); }}>
            <Plus size={15} /> Assign module
          </button>
        </div>
      </div>

      <div className="search-row">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--text-dim)' }} />
          <input placeholder="Search by name, role or department…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-chips" style={{ marginBottom: 18 }}>
        <button className={`chip ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>All</button>
        <button className={`chip ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => setRoleFilter('admin')}>Admins</button>
        <button className={`chip ${roleFilter === 'staff' ? 'active' : ''}`} onClick={() => setRoleFilter('staff')}>Staff</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Type</th>
              <th>Department</th>
              <th>Modules</th>
              <th>Completed</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const sa       = assignments.filter(a => a.staffId === s.id);
              const done     = sa.filter(a => a.status === 'completed').length;
              const pct      = sa.length ? Math.round((done / sa.length) * 100) : 0;
              const overdue  = sa.some(a => a.status !== 'completed' && new Date(a.dueDate) < new Date());
              const allDone  = sa.length > 0 && done === sa.length;
              return (
                <tr key={s.id}>
                  <td>
                    <div className="staff-name-cell">
                      <Avatar person={s} />
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.role || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {s.is_admin
                      ? <span className="badge" style={{ background: 'rgba(0,212,184,0.12)', color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={11} /> Admin</span>
                      : <span className="badge badge-not_started" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={11} /> Staff</span>
                    }
                  </td>
                  <td>{s.dept}</td>
                  <td>{sa.length}</td>
                  <td>{done} / {sa.length}</td>
                  <td style={{ width: 150 }}>
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
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openAssign(s.id)}>
                        <Plus size={12} /> Assign
                      </button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(s)} title="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state"><p>No staff members found.</p></div>
        )}
      </div>

      {isAdmin && <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} />}
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} prefillStaffId={assignStaffId} />
      <DeleteStaffModal member={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}
