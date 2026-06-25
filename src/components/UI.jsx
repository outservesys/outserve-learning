import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {toast.msg}
    </div>
  );
}

export function Badge({ status, category, children }) {
  if (category) {
    const map = { IT: 'it', COMPLIANCE: 'comp', SOFT: 'soft' };
    return <span className={`badge badge-${map[category] || 'it'}`}>{children}</span>;
  }
  return <span className={`badge badge-${status}`}>{children}</span>;
}

export function StatusBadge({ assignment }) {
  const today = new Date();
  const due = new Date(assignment.dueDate);
  if (assignment.status === 'completed') return <span className="badge badge-completed">Completed</span>;
  if (assignment.status !== 'completed' && due < today) return <span className="badge badge-overdue">Overdue</span>;
  if (assignment.status === 'in_progress') return <span className="badge badge-in_progress">In progress</span>;
  return <span className="badge badge-not_started">Not started</span>;
}

export function Avatar({ person, size = 32 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: person.color + '22', color: person.color, fontSize: size < 36 ? 11 : 14 }}>
      {person.avatar}
    </div>
  );
}

export function ProgressBar({ value, style }) {
  return (
    <div className="prog-bar" style={style}>
      <div className="prog-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export function ProgressRow({ value }) {
  return (
    <div className="prog-row">
      <ProgressBar value={value} style={{ flex: 1 }} />
      <span className="prog-pct">{value}%</span>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
