import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background accent */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3,
        background: 'var(--cyan)',
      }} />

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/outserve-logo.png" alt="Outserve" style={{ height: 32, marginBottom: 14 }} />
          <div style={{ fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 500, textTransform: 'uppercase' }}>
            Learning Centre
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--navy-light)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 32px 28px',
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Sign in</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
            Use your Outserve Learning account credentials.
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@outserve.co.uk"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--danger)',
                marginBottom: 18,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: 14, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : <><LogIn size={15} /> Sign in</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 20 }}>
          Don't have an account? Contact your Learning &amp; Development administrator.
        </p>
      </div>
    </div>
  );
}
