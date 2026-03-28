import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesApi, modulesApi, lessonsApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

/* ── helpers ─────────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '0.9rem 1rem', borderRadius: '12px',
  border: '2px solid #e5e7eb', fontSize: '0.95rem', outline: 'none',
  boxSizing: 'border-box', background: '#fafafa', color: '#111827',
  transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
};
const focusIn  = e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; e.target.style.background = 'white'; };
const focusOut = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafafa'; };

/* ── sub-component: AddModuleForm ─────────────────── */
const AddModuleForm = ({ courseId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const submit = async e => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await modulesApi.create({ title: title.trim(), course: courseId });
      setTitle('');
      showToast('Module created!', 'success');
      onCreated(res.data);
    } catch (err) {
      const msg = err?.response?.data?.detail || Object.values(err?.response?.data || {}).flat()[0] || 'Failed to create module';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        value={title} onChange={e => setTitle(e.target.value)}
        placeholder="New module title…"
        style={{ ...inputStyle, flex: 1, padding: '0.7rem 1rem' }}
        onFocus={focusIn} onBlur={focusOut}
        required
      />
      <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.5rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}>
        {saving ? '…' : '+ Add Module'}
      </button>
    </form>
  );
};

/* ── sub-component: AddLessonForm ────────────────── */
const AddLessonForm = ({ moduleId, onCreated }) => {
  const [form, setForm] = useState({ title: '', video_url: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { showToast } = useToast();

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await lessonsApi.create({
        title: form.title.trim(),
        module: moduleId,
        content: form.content || undefined,
        video_url: form.video_url || undefined,
      });
      setForm({ title: '', video_url: '', content: '' });
      setExpanded(false);
      showToast('Lesson added!', 'success');
      onCreated(res.data, moduleId);
    } catch (err) {
      const msg = err?.response?.data?.detail || Object.values(err?.response?.data || {}).flat()[0] || 'Failed to create lesson';
      showToast(msg, 'error');
    } finally { setSaving(false); }
  };

  if (!expanded) return (
    <button onClick={() => setExpanded(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1rem', borderRadius: '10px', border: '2px dashed #d1d5db', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}>
      ＋ Add Lesson
    </button>
  );

  return (
    <form onSubmit={submit} style={{ background: '#f0fdf4', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', flexDirection: 'column', gap: '0.8rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46', marginBottom: '0.25rem' }}>📝 New Lesson</div>
      <input name="title" value={form.title} onChange={change} placeholder="Lesson title * " style={{ ...inputStyle, padding: '0.7rem 0.9rem' }} onFocus={focusIn} onBlur={focusOut} required />
      <input name="video_url" value={form.video_url} onChange={change} placeholder="Video URL (optional)" type="url" style={{ ...inputStyle, padding: '0.7rem 0.9rem' }} onFocus={focusIn} onBlur={focusOut} />
      <textarea name="content" value={form.content} onChange={change} placeholder="Lesson notes / content (optional)" rows={2} style={{ ...inputStyle, padding: '0.7rem 0.9rem', resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.65rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Lesson'}
        </button>
        <button type="button" onClick={() => setExpanded(false)} style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

/* ── main page ───────────────────────────────────── */
const CourseContentManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);       // [{...module, lessons:[...]}]
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  /* fetch course detail (includes modules + lessons if serialized) */
  const fetchCourse = useCallback(async () => {
    try {
      const res = await coursesApi.detail(id);
      const data = res.data;
      setCourse(data);

      // Backend may return nested modules with lessons
      const mods = Array.isArray(data.modules) ? data.modules : [];
      setModules(mods.map(m => ({
        ...m,
        lessons: Array.isArray(m.lessons) ? m.lessons : [],
      })));

      if (mods.length > 0) setExpandedModule(mods[0].id);
    } catch (err) {
      console.error(err);
      showToast('Failed to load course content.', 'error');
    } finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleModuleCreated = newMod => {
    const mod = { ...newMod, lessons: [] };
    setModules(prev => [...prev, mod]);
    setExpandedModule(newMod.id);
  };

  const handleLessonCreated = (newLesson, moduleId) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
    ));
  };

  /* ── render ── */
  if (isLoading) return (
    <div style={{ paddingTop: '150px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</div>
      <h2>Loading course content…</h2>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', paddingTop: '110px', paddingBottom: '50px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <Link to="/instructor/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                ← Back to Dashboard
              </Link>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
                <span style={{ color: '#86efac', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content Manager</span>
              </div>
              <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                {course?.title || 'Course Content'}
              </h1>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>📦 {modules.length} modules</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>📝 {modules.reduce((a, m) => a + m.lessons.length, 0)} lessons</span>
                <span style={{ color: course?.is_published ? '#34d399' : '#fbbf24', fontSize: '0.9rem', fontWeight: 700 }}>
                  {course?.is_published ? '✅ Published' : '📝 Draft'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to={`/courses/${id}/edit`} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: 700, background: 'rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                ✏️ Edit Details
              </Link>
              <Link to={`/courses/${id}`} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', color: 'white', textDecoration: 'none', fontWeight: 700, background: 'linear-gradient(135deg,#10b981,#059669)', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                👁️ Preview Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem', maxWidth: '900px' }}>

        {/* Add Module */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem' }}>📦 Add New Module</h3>
          <AddModuleForm courseId={id} onCreated={handleModuleCreated} />
        </div>

        {/* Module list */}
        {modules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>No modules yet</h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Add your first module above to start building your course content.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {modules.map((module, mIdx) => {
              const isOpen = expandedModule === module.id;
              return (
                <div key={module.id} style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.3s' }}>
                  {/* Module header */}
                  <button
                    onClick={() => setExpandedModule(isOpen ? null : module.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                        {mIdx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>{module.title}</div>
                        <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.15rem' }}>{module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.1rem', color: '#6b7280', transition: 'transform 0.3s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                  </button>

                  {/* Module body */}
                  {isOpen && (
                    <div style={{ padding: '0.5rem 1.75rem 1.5rem', borderTop: '1px solid #f9fafb', animation: 'fadeIn 0.3s ease' }}>
                      {/* Existing lessons */}
                      {module.lessons.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                          {module.lessons.map((lesson, lIdx) => (
                            <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
                                {lIdx + 1}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>{lesson.title}</div>
                                {lesson.video_url && <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🎬 {lesson.video_url}</div>}
                                {lesson.content && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {lesson.content}</div>}
                              </div>
                              <span style={{ background: '#ecfdf5', color: '#065f46', borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>LESSON</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0 0.75rem', fontWeight: 500 }}>
                          No lessons yet — add one below
                        </div>
                      )}
                      {/* Add lesson */}
                      <AddLessonForm moduleId={module.id} onCreated={handleLessonCreated} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Publish hint */}
        {modules.length > 0 && (
          <div style={{ marginTop: '2rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>Ready to go live?</strong>
              <p style={{ color: '#92400e', fontSize: '0.88rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                Once you're happy with your content, head back to your{' '}
                <Link to="/instructor/dashboard" style={{ color: '#b45309', fontWeight: 700 }}>dashboard</Link>{' '}
                and click <strong>Publish</strong> to make the course available to students.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentManager;
