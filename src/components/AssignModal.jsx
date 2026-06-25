import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, formatDuration } from './UI';

export default function AssignModal({ open, onClose, prefillStaffId = null, prefillModuleId = null }) {
  const { modules, staff, addAssignment } = useApp();
  const [staffId, setStaffId] = useState(prefillStaffId || '');
  const [moduleId, setModuleId] = useState(prefillModuleId || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const handleSubmit = () => {
    if (!staffId || !moduleId || !dueDate) return;
    addAssignment({
      staffId,
      moduleId,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'not_started',
      progress: 0,
      score: null,
    });
    onClose();
    setStaffId(prefillStaffId || '');
    setModuleId(prefillModuleId || '');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign training module"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!staffId || !moduleId}>Assign module</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Staff member</label>
        <select className="form-select" value={staffId} onChange={e => setStaffId(e.target.value)}>
          <option value="">Select a staff member…</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Training module</label>
        <select className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)}>
          <option value="">Select a module…</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title} ({formatDuration(m.duration)})</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Due date</label>
        <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
      </div>
    </Modal>
  );
}
