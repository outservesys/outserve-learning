import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { formatDuration } from '../components/UI';
import {
  ArrowLeft, Plus, Trash2, Edit2, GripVertical, Check, X,
  BookOpen, FileText, Video, ClipboardList, ChevronDown, ChevronUp,
  Image, Upload, ExternalLink, Type, AlignLeft,
} from 'lucide-react';
import { LEVEL_STYLES } from './Modules';

const CONTENT_TYPES = [
  { value: 'text',  label: 'Reading', icon: FileText },
  { value: 'video', label: 'Video',   icon: Video },
  { value: 'quiz',  label: 'Quiz',    icon: ClipboardList },
];

// ── Helpers ───────────────────────────────────────────────────
function parseBlocks(raw) {
  if (!raw) return [{ id: Date.now(), type: 'text', value: '' }];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length ? parsed : [{ id: Date.now(), type: 'text', value: '' }];
  } catch {}
  // Legacy plain string — wrap in a single text block
  return [{ id: Date.now(), type: 'text', value: raw }];
}

// ── Inline title edit ─────────────────────────────────────────
function InlineEdit({ value, onSave, placeholder, multiline = false, style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);
  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };
  if (editing) return (
    <div>
      {multiline
        ? <textarea className="form-textarea" value={draft} onChange={e => setDraft(e.target.value)} autoFocus style={{ ...style, minHeight: 80 }} />
        : <input className="form-input" value={draft} onChange={e => setDraft(e.target.value)} autoFocus style={style}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }} />
      }
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button className="btn btn-primary btn-sm" onClick={save}><Check size={12} /> Save</button>
        <button className="btn btn-ghost btn-sm" onClick={cancel}><X size={12} /> Cancel</button>
      </div>
    </div>
  );
  return (
    <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, ...style }} title="Click to edit">
      <span style={{ flex: 1, color: value ? 'inherit' : 'var(--text-dim)', whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>{value || placeholder}</span>
      <Edit2 size={13} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2, opacity: 0.6 }} />
    </div>
  );
}

// ── Single image block uploader ───────────────────────────────
function ImageBlock({ block, lessonId, onChange, onDelete, showToast }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB', 'error'); return; }
    setUploading(true);
    const path = `lesson-images/${lessonId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from('profiles').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { showToast('Upload failed: ' + error.message, 'error'); setUploading(false); return; }
    const { data } = supabase.storage.from('profiles').getPublicUrl(path);
    onChange({ ...block, url: data.publicUrl });
    showToast('Image uploaded');
    setUploading(false);
  };

  if (!block.url) return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius)',
          padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
          background: uploading ? 'var(--cyan-dim)' : 'var(--surface)',
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      >
        <Image size={22} color="var(--text-dim)" style={{ marginBottom: 8, opacity: 0.5 }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{uploading ? 'Uploading…' : 'Click to upload image'}</p>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>PNG, JPG, GIF, WebP — max 10MB</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <img src={block.url} alt={block.caption || ''} style={{ width: '100%', maxHeight: 380, objectFit: 'contain', background: 'rgba(0,0,0,0.15)', display: 'block' }} />
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          className="form-input"
          value={block.caption || ''}
          onChange={e => onChange({ ...block, caption: e.target.value })}
          placeholder="Add a caption (optional)…"
          style={{ flex: 1, fontSize: 12 }}
        />
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => fileRef.current?.click()} title="Replace image"><Upload size={13} /></button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={onDelete} title="Remove image"><Trash2 size={13} /></button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

// ── Rich content editor (text + images mixed) ─────────────────
function RichEditor({ lessonId, rawContent, onSave, showToast }) {
  const [blocks, setBlocks] = useState(() => parseBlocks(rawContent));

  // Debounced save
  const saveTimer = useRef(null);
  const save = (newBlocks) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onSave(JSON.stringify(newBlocks)), 800);
  };

  const update = (id, changes) => {
    const next = blocks.map(b => b.id === id ? { ...b, ...changes } : b);
    setBlocks(next);
    save(next);
  };

  const addBlock = (type, afterId) => {
    const idx = blocks.findIndex(b => b.id === afterId);
    const newBlock = { id: Date.now(), type, value: '', url: '', caption: '' };
    const next = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
    setBlocks(next);
    save(next);
  };

  const deleteBlock = (id) => {
    if (blocks.length === 1) { update(id, { value: '', url: '' }); return; }
    const next = blocks.filter(b => b.id !== id);
    setBlocks(next);
    save(next);
  };

  return (
    <div>
      {blocks.map((block, i) => (
        <div key={block.id} style={{ marginBottom: 12 }}>
          {block.type === 'text' ? (
            <div style={{ position: 'relative' }}>
              <textarea
                className="form-textarea"
                value={block.value}
                onChange={e => update(block.id, { value: e.target.value })}
                placeholder="Write your content here…"
                style={{ minHeight: 100, fontSize: 14, lineHeight: 1.7, paddingRight: 36 }}
              />
              {blocks.length > 1 && (
                <button
                  onClick={() => deleteBlock(block.id)}
                  title="Remove this block"
                  style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 4 }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <ImageBlock
              block={block}
              lessonId={lessonId}
              onChange={changes => update(block.id, changes)}
              onDelete={() => deleteBlock(block.id)}
              showToast={showToast}
            />
          )}

          {/* Insert buttons between blocks */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <button
              onClick={() => addBlock('text', block.id)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '3px 10px' }}
              title="Insert text block"
            >
              <AlignLeft size={12} /> Text
            </button>
            <button
              onClick={() => addBlock('image', block.id)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '3px 10px' }}
              title="Insert image"
            >
              <Image size={12} /> Image
            </button>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lesson row ────────────────────────────────────────────────
function LessonRow({ lesson, position, onUpdate, onDelete, expanded, onToggle, showToast }) {
  const [localType, setLocalType] = React.useState(lesson.content_type);
  React.useEffect(() => setLocalType(lesson.content_type), [lesson.content_type]);

  const ContentIcon = CONTENT_TYPES.find(t => t.value === localType)?.icon || FileText;

  // Summary for header
  const summary = (() => {
    if (localType === 'video') return lesson.content ? '1 video' : '';
    if (localType === 'quiz')  return lesson.content ? 'Has instructions' : '';
    if (localType === 'text') {
      try {
        const blocks = JSON.parse(lesson.content || '[]');
        if (Array.isArray(blocks)) {
          const imgs = blocks.filter(b => b.type === 'image' && b.url).length;
          const txt  = blocks.filter(b => b.type === 'text' && b.value).length;
          const parts = [];
          if (txt)  parts.push(`${txt} text block${txt > 1 ? 's' : ''}`);
          if (imgs) parts.push(`${imgs} image${imgs > 1 ? 's' : ''}`);
          return parts.join(', ');
        }
      } catch {}
      return lesson.content ? 'Has content' : '';
    }
    return '';
  })();

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }} onClick={onToggle}>
        <GripVertical size={15} color="var(--text-dim)" style={{ flexShrink: 0, opacity: 0.4 }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--cyan)', flexShrink: 0 }}>
          {position}
        </div>
        <ContentIcon size={15} color="var(--text-dim)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{lesson.title || <span style={{ color: 'var(--text-dim)' }}>Untitled lesson</span>}</div>
          {summary && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>{summary}</div>}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginRight: 8, flexShrink: 0 }}>
          {CONTENT_TYPES.find(t => t.value === localType)?.label || 'Reading'}
        </span>
        <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); onDelete(lesson.id); }}>
          <Trash2 size={13} />
        </button>
        {expanded ? <ChevronUp size={15} color="var(--text-dim)" /> : <ChevronDown size={15} color="var(--text-dim)" />}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
          <div className="form-group">
            <label className="form-label">Lesson title</label>
            <InlineEdit value={lesson.title} onSave={v => onUpdate(lesson.id, { title: v })} placeholder="Enter lesson title…" />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CONTENT_TYPES.map(t => {
                const Icon = t.icon;
                const active = localType === t.value;
                return (
                  <button key={t.value}
                    onClick={() => { setLocalType(t.value); onUpdate(lesson.id, { content_type: t.value, content: '' }); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '1px solid var(--cyan-border)' : '1px solid var(--border)',
                      background: active ? 'var(--cyan-dim)' : 'var(--surface2)',
                      color: active ? 'var(--cyan)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
                    }}>
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {localType === 'text' && (
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 10 }}>Content — mix text and images freely</label>
              <RichEditor
                lessonId={lesson.id}
                rawContent={lesson.content}
                onSave={v => onUpdate(lesson.id, { content: v })}
                showToast={showToast}
              />
            </div>
          )}

          {localType === 'video' && (
            <div className="form-group">
              <label className="form-label">Video URL</label>
              <InlineEdit value={lesson.content} onSave={v => onUpdate(lesson.id, { content: v })} placeholder="Paste a YouTube or Vimeo URL…" style={{ fontSize: 13 }} />
              {lesson.content && (
                <a href={lesson.content} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <ExternalLink size={12} /> Open video
                </a>
              )}
            </div>
          )}

          {localType === 'quiz' && (
            <div className="form-group">
              <label className="form-label">Quiz instructions</label>
              <InlineEdit value={lesson.content} onSave={v => onUpdate(lesson.id, { content: v })} placeholder="Describe what the learner needs to complete…" multiline style={{ fontSize: 13 }} />
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
  const [lessons, setLessons]   = useState([]);
  const [loadingL, setLoadingL] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const module = modules.find(m => m.id === id);

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
    const remaining = lessons.filter(l => l.id !== lessonId);
    remaining.forEach((l, i) => supabase.from('lessons').update({ position: i + 1 }).eq('id', l.id));
    setLessons(remaining);
    showToast('Lesson deleted');
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/modules')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to modules
      </button>

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
            <InlineEdit value={module.title} onSave={v => updateModule(id, { title: v })} placeholder="Module title" style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }} />
            <InlineEdit value={module.description} onSave={v => updateModule(id, { description: v })} placeholder="Add a description…" multiline style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Lessons</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} — click to expand and edit</div>
        </div>
        <button className="btn btn-primary" onClick={addLesson}><Plus size={14} /> Add lesson</button>
      </div>

      {loadingL ? (
        <div style={{ color: 'var(--text-dim)', padding: '20px 0', fontSize: 13 }}>Loading lessons…</div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface)', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)' }}>
          <BookOpen size={28} color="var(--text-dim)" style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>No lessons yet — add the first one to get started.</p>
          <button className="btn btn-primary" onClick={addLesson}><Plus size={14} /> Add first lesson</button>
        </div>
      ) : (
        <div>
          {lessons.map((lesson, i) => (
            <LessonRow key={lesson.id} lesson={lesson} position={i + 1}
              onUpdate={updateLesson} onDelete={deleteLesson}
              expanded={expandedId === lesson.id}
              onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
              showToast={showToast}
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
