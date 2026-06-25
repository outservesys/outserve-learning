import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Modal } from './UI';
import { Eye, EyeOff } from 'lucide-react';

export default function CreateAccountModal({ open, onClose }) {
  const { createAccount } = useAuth();
  const { refetch }       = useApp();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: '', dept: 'Technology', userType: 'staff',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    const result = await createAccount(form);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    await refetch();
    onClose();
    setForm({ name: '', email: '', password: '', role: '', dept: 'Technology', userType: 'staff' });
  };

  const handleClose = () => { setError(''); onClose(); };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create account"
      footer={
        <>
          <button className="btn btn-ghost" onClick={handleClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </>
      }
    >
      {/* User type selector */}
      <div className="form-group">
        <label className="form-label">Account type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { value: 'staff', label: 'Staff', desc: 'Access own learning plan' },
            { value: 'admin', label: 'Admin', desc: 'Full portal management' },
          ].map(opt => (
            <div
              key={opt.value}
              onClick={() => set('userType', opt.value)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: form.userType === opt.value ? '1px solid var(--cyan-border)' : '1px solid var(--border)',
                background: form.userType === opt.value ? 'var(--cyan-dim)' : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `2px solid ${form.userType === opt.value ? 'var(--cyan)' : 'var(--border-strong)'}`,
                  background: form.userType === opt.value ? 'var(--cyan)' : 'transparent',
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: 13, color: form.userType === opt.value ? 'var(--cyan)' : 'var(--text)' }}>
                  {opt.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', paddingLeft: 22 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Full name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jane Smith" />
      </div>

      <div className="form-group">
        <label className="form-label">Email address</label>
        <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@outserve.co.uk" />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Minimum 8 characters"
            style={{ paddingRight: 42 }}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div className="form-hint">The user will sign in with this password and can change it later.</div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Job title</label>
          <input className="form-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. IT Support Engineer" />
        </div>
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
      </div>

      {error && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginTop: 4 }}>
          {error}
        </div>
      )}
    </Modal>
  );
}
