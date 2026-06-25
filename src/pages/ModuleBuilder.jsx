import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Modal, formatDuration } from '../components/UI';
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical, Check, X,
  BookOpen, FileText, Video, ClipboardList, ChevronDown, ChevronUp, Save,
} from 'lucide-react';
import { LEVEL_STYLES } from './Modules';

const CONTENT_TYPES = [
  { value: 'text',  label: 'Reading',    icon: FileText },
  { value: 'video', label: 'Video',      icon: Video },
  { value: 'quiz',  label: 'Quiz',       icon: ClipboardList },
];

// ── Inline editable text ──────────────────────────────────────
function InlineEdit({ value, onSave, placeholder, multiline = false, style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  if (editing) {
    return (
      <div>
        {multiline
          ? <textarea className="form-textarea" value={draft} onChange={e => setDraft(e.target.value)} autoFocus style={{ ...style, minHeight: 100 }} />
          : <input className="form-input" value={draft} onChange={e => setDraft(e.target.value)} autoFocus style={style}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }} />
        }
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={save}><Check size={12} /> Save</button>
          <button className="btn btn-ghost btn-sm" onClick={cancel}><X size={12} /> Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={() => setEditing(true)}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, ...style }}
      title="Click to edit"
    >
      <span style={{ flex: 1, color: value ? 'inherit' : 'var(--text-dim)' }}>{value || placeholder}</span>
      <Edit2 size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2, opacity: 0.6 }} />
    </div>
  );
}

// ── Lesson row ────────────────────────────────────────────────
function LessonRow({ lesson, position, onUpdate, onDelete, expanded, onToggle }) {
  const ContentIcon = CONTENT_TYPES.find(t => t.value === lesson.content_type)?.icon || FileText;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 10,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}
        onClick={onToggle}>
        <GripVertical size={15} color="var(--text-dim)" style={{ flexShrink: 0, opacity: 0.4 }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--cyan)', flexShrink: 0 }}>
          {position}
        </div>
        <ContentIcon size={15} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{lesson.title || <span style={{ color: 'var(--text-dim)' }}>Untitled lesson</span>}</span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginRight: 8 }}>
          {CONTENT_TYPES.find(t => t.value === lesson.content_type)?.label || 'Reading'}
        </span>
        <button className="btn btn-danger btn-sm btn-icon"
          onClick={e => { e.stopPropagation(); onDelete(lesson.id); }}
          title="Delete lesson">
          <Trash2 size={13} />
        </button>
        {expanded ? <ChevronUp size={15} color="var(--text-dim)" /> : <ChevronDown size={15} color="var(--text-dim)" />}
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
          <div className="form-group">
            <label className="form-label">Lesson title</label>
            <InlineEdit value={lesson.title} onSave={v => onUpdate(lesson.id, { title: v })} placeholder="Enter lesson title…" />
          </div>
          <div className="form-group">
            <label className="form-label">Content type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CONTENT_TYPES.map(t => {
                const Icon = t.icon;
                const active = lesson.content_type === t.value;
                return (
                  <button key={t.value}
                    onClick={() => onUpdate(lesson.id, { content_type: t.value })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      borderRadius: 'var(--radius-sm)', border: active ? '1px solid var(--cyan-border)' : '1px solid var(--border)',
                      background: active ? 'var(--cyan-dim)' : 'var(--surface2)',
                      color: active ? 'var(--cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
                    }}>
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              {lesson.content_type === 'video' ? 'Video URL' : lesson.content_type === 'quiz' ? 'Quiz instructions' : 'Content'}
            </label>
            <InlineEdit
              value={lesson.content}
              onSave={v => onUpdate(lesson.id, { content: v })}
              placeholder={
                lesson.content_type === 'video' ? 'Paste YouTube or Vimeo URL…'
                : lesson.content_type === 'quiz' ? 'Describe what the learner needs to do…'
                : 'Write the lesson content here…'
              }
              multiline
              style={{ fontSize: 13, lineHeight: 1.7 }}
            />
          </div>
          {lesson.content_type === 'video' && lesson.content && (
            <div style={{ marginTop: 8 }}>
              <a href={lesson.content} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--cyan)' }}>
                Open video ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ModuleBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modules, updateModule, categories, showToast } = useApp();
  const [lessons, setLessons]     = useState([]);
  const [loadingL, setLoadingL]   = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving]       = useState(false);

  const module = modules.find(m => m.id === id);

  // Load lessons from Supabase
  useEffect(() => {
    if (!id) return;
    supabase.from('lessons').select('*').eq('module_id', id).order('position')
      .then(({ data, error }) => {
        if (error) { showToast('Failed to load lessons', 'error'); return; }
        setLessons(data || []);
        setLoadingL(false);
      });
  }, [id]);

  if (!module) return (
    <div style={{ padding: 40, color: 'var(--text-muted)' }}>
      Module not found. <button className="btn btn-ghost btn-sm" onClick={() => navigate('/modules')}>Back to modules</button>
    </div>
  );

  const cat = categories.find(c => c.key === module.category);
  const levelStyle = LEVEL_STYLES[module.level] || LEVEL_STYLES.Beginner;

  // ── Lesson CRUD ───────────────────────────────────────────
  const addLesson = async () => {
    const position = lessons.length + 1;
    const { data, error } = await supabase.from('lessons')
      .insert([{ module_id: id, title: `Lesson ${position}`, content_type: 'text', content: '', position }])
      .select().single();
    if (error) { showToast('Failed to add lesson', 'error'); return; }
    setLessons(prev => [...prev, data]);
    setExpandedId(data.id);
  };

  const updateLesson = async (lessonId, updates) => {
    const { error } = await supabase.from('lessons').update(updates).eq('id', lessonId);
    if (error) { showToast('Failed to save', 'error'); return; }
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...updates } : l));
  };

  const deleteLesson = async (lessonId) => {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) { showToast('Failed to delete lesson', 'error'); return; }
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    // Re-number positions
    const remaining = lessons.filter(l => l.id !== lessonId);
    remaining.forEach((l, i) => supabase.from('lessons').update({ position: i + 1 }).eq('id', l.id));
    showToast('Lesson deleted');
  };

  const saveModuleSettings = async (field, value) => {
    setSaving(true);
    await updateModule(id, { [field]: value });
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Back nav */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/modules')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to modules
      </button>

      {/* Module header */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} color="var(--cyan)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {module.module_code && (
                <span style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', color: 'var(--text-dim)' }}>
                  {module.module_code}
                </span>
              )}
              {cat && <span className="badge" style={{ background: cat.color + '22', color: cat.color }}>{cat.label}</span>}
              {module.level && <span className="badge" style={{ background: levelStyle.bg, color: levelStyle.color }}>{module.level}</span>}
            </div>
            <InlineEdit
              value={module.title}
              onSave={v => saveModuleSettings('title', v)}
              placeholder="Module title"
              style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}
            />
            <InlineEdit
              value={module.description}
              onSave={v => saveModuleSettings('description', v)}
              placeholder="Add a description…"
              multiline
              style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { label: 'Duration', value: formatDuration(module.duration) },
            { label: 'Lessons', value: lessons.length },
            { label: 'Pass mark', value: (module.pass_mark ?? module.passMark ?? 80) + '%' },
            { label: 'Level', value: module.level || 'Beginner' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Lessons</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} — click a lesson to edit its content</div>
        </div>
        <button className="btn btn-primary" onClick={addLesson}>
          <Plus size={14} /> Add lesson
        </button>
      </div>

      {loadingL ? (
        <div style={{ color: 'var(--text-dim)', padding: '20px 0', fontSize: 13 }}>Loading lessons…</div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)' }}>
          <BookOpen size={28} color="var(--text-dim)" style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>No lessons yet — add the first one to get started.</p>
          <button className="btn btn-primary" onClick={addLesson}><Plus size={14} /> Add first lesson</button>
        </div>
      ) : (
        <div>
          {lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              position={i + 1}
              onUpdate={updateLesson}
              onDelete={deleteLesson}
              expanded={expandedId === lesson.id}
              onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
            />
          ))}
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={addLesson}>
            <Plus size={14} /> Add lesson
          </button>
        </div>
      )}
    </div>
  );
}
