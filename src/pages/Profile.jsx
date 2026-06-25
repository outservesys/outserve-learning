import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Camera, Save, Target, BookOpen, Briefcase, MapPin, Phone, Link, Edit2, Check, X } from "lucide-react";

function Avatar({ profile, size = 80, photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={profile?.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan-border)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: profile?.color ? profile.color + '22' : 'var(--cyan-dim)',
      color: profile?.color || 'var(--cyan)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 600,
      border: '2px solid var(--cyan-border)',
      flexShrink: 0,
    }}>
      {profile?.avatar || '?'}
    </div>
  );
}

function EditableField({ label, value, onSave, placeholder, multiline = false, icon: Icon }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { setDraft(value || ''); }, [value]);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {Icon && <Icon size={13} color="var(--text-dim)" />}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      </div>
      {editing ? (
        <div>
          {multiline ? (
            <textarea
              className="form-textarea"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              autoFocus
              rows={4}
            />
          ) : (
            <input
              className="form-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            />
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={save}><Check size={12} /> Save</button>
            <button className="btn btn-ghost btn-sm" onClick={cancel}><X size={12} /> Cancel</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{
            padding: '10px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            color: value ? 'var(--text)' : 'var(--text-dim)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            minHeight: 42,
            lineHeight: 1.6,
            transition: 'border-color 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span style={{ flex: 1, whiteSpace: multiline ? 'pre-wrap' : 'nowrap', overflow: 'hidden', textOverflow: multiline ? 'clip' : 'ellipsis' }}>
            {value || placeholder}
          </span>
          <Edit2 size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { profile, setProfile } = useAuth();
  const [photoUrl, setPhotoUrl]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const fileRef = useRef();

  // Load photo from Supabase Storage on mount
  useEffect(() => {
    if (!profile?.id) return;
    const path = `avatars/${profile.id}`;
    supabase.storage.from('profiles').getPublicUrl(path).then(({ data }) => {
      if (data?.publicUrl) {
        // Check if the file actually exists by trying to load it
        const img = new Image();
        img.onload = () => setPhotoUrl(data.publicUrl + '?t=' + Date.now());
        img.src = data.publicUrl;
      }
    });
  }, [profile?.id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Photo must be under 5MB'); return; }

    setUploading(true);
    const path = `avatars/${profile.id}`;
    const { error } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) { showToast('Upload failed: ' + error.message); setUploading(false); return; }

    const { data } = supabase.storage.from('profiles').getPublicUrl(path);
    setPhotoUrl(data.publicUrl + '?t=' + Date.now());
    setUploading(false);
    showToast('Photo updated');
  };

  const saveField = async (field, value) => {
    setSaving(true);
    const { error } = await supabase.from('staff').update({ [field]: value }).eq('id', profile.id);
    setSaving(false);
    if (error) { showToast('Failed to save'); return; }
    setProfile(prev => ({ ...prev, [field]: value }));
    showToast('Saved');
  };

  if (!profile) return null;

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--navy-light)', border: '1px solid var(--cyan-border)', color: 'var(--cyan)', padding: '12px 20px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, zIndex: 999, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={14} /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">My profile</h1>
          <p className="page-sub">Personal details, contact info and learning goals</p>
        </div>
      </div>

      {/* Profile hero card */}
      <div className="card" style={{ marginBottom: 20, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {/* Photo */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar profile={profile} size={90} photoUrl={photoUrl} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--cyan)', border: '2px solid var(--navy-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'opacity 0.15s',
                opacity: uploading ? 0.6 : 1,
              }}
              title="Change photo"
            >
              <Camera size={13} color="var(--navy)" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          {/* Name + role + type */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{profile.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>{profile.role || 'No job title set'} {profile.dept ? `· ${profile.dept}` : ''}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge" style={{ background: profile.is_admin ? 'rgba(0,212,184,0.12)' : 'var(--surface2)', color: profile.is_admin ? 'var(--cyan)' : 'var(--text-dim)' }}>
                {profile.is_admin ? '⬡ Admin' : '◎ Staff'}
              </span>
              {profile.dept && <span className="badge badge-not_started">{profile.dept}</span>}
            </div>
          </div>

          {uploading && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>Uploading…</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Personal details */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={15} color="var(--cyan)" /> Personal details
          </div>
          <EditableField label="Full name"   value={profile.name}       onSave={v => saveField('name', v)}  placeholder="Your full name"       icon={null} />
          <EditableField label="Job title"   value={profile.role}       onSave={v => saveField('role', v)}  placeholder="e.g. IT Support Engineer" icon={null} />
          <EditableField label="Department"  value={profile.dept}       onSave={v => saveField('dept', v)}  placeholder="e.g. Technology"      icon={null} />
          <EditableField label="Location"    value={profile.location}   onSave={v => saveField('location', v)} placeholder="e.g. Manchester, UK" icon={MapPin} />
          <EditableField label="Phone"       value={profile.phone}      onSave={v => saveField('phone', v)} placeholder="e.g. 07700 900123"    icon={Phone} />
          <EditableField label="LinkedIn"    value={profile.linkedin}   onSave={v => saveField('linkedin', v)} placeholder="linkedin.com/in/yourname" icon={Link} />
        </div>

        {/* About & aspirations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={15} color="var(--cyan)" /> About me
            </div>
            <EditableField
              label="Bio"
              value={profile.bio}
              onSave={v => saveField('bio', v)}
              placeholder="Tell your colleagues a bit about yourself…"
              multiline
            />
            <EditableField
              label="Skills & expertise"
              value={profile.skills}
              onSave={v => saveField('skills', v)}
              placeholder="e.g. Networking, Azure, Customer Service…"
              multiline
            />
          </div>

          <div className="card" style={{ border: '1px solid var(--cyan-border)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={15} color="var(--cyan)" /> Learning aspirations
            </div>
            <EditableField
              label="What I want to learn"
              value={profile.learning_goals}
              onSave={v => saveField('learning_goals', v)}
              placeholder="What skills or knowledge are you looking to develop?"
              multiline
            />
            <EditableField
              label="Career goals"
              value={profile.career_goals}
              onSave={v => saveField('career_goals', v)}
              placeholder="Where do you want to be in 1–3 years?"
              multiline
            />
            <EditableField
              label="Preferred learning style"
              value={profile.learning_style}
              onSave={v => saveField('learning_style', v)}
              placeholder="e.g. Hands-on, video, reading, instructor-led…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
