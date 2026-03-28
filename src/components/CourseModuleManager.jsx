import { useState } from 'react';
import { modulesApi, lessonsApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const CourseModuleManager = ({ courseId, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState('module');
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [modules, setModules] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) {
      showToast('Module title is required.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const res = await modulesApi.create({ title: moduleTitle.trim(), course: courseId });
      const newModule = res.data;
      setModules(prev => [...prev, newModule]);
      setSelectedModuleId(newModule.id);
      setModuleTitle('');
      showToast('Module created! You can now add lessons to it.', 'success');
      onSaved?.();
      setActiveTab('lesson');
    } catch (err) {
      const msg = err?.response?.data?.detail || Object.values(err?.response?.data || {}).flat()[0] || 'Failed to create module.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      showToast('Lesson title is required.', 'warning');
      return;
    }
    if (!selectedModuleId) {
      showToast('Please select a module first.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      await lessonsApi.create({
        title: lessonTitle.trim(),
        module: selectedModuleId,
        content: lessonContent,
        video_url: lessonVideoUrl || undefined,
      });
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      showToast('Lesson added successfully!', 'success');
      onSaved?.();
    } catch (err) {
      const msg = err?.response?.data?.detail || Object.values(err?.response?.data || {}).flat()[0] || 'Failed to create lesson.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease' }}>
        {/* Header */}
        <div style={{ padding: '2rem 2rem 1.5rem', background: 'linear-gradient(135deg, #f0fdf4, #f0f9ff)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Course Content Manager</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add modules and lessons to your course</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[{ key: 'module', label: '📦 Add Module' }, { key: 'lesson', label: '📝 Add Lesson' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === tab.key ? 'white' : '#f9fafb', fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem', borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'module' && (
            <form onSubmit={handleCreateModule} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Module Title *</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  placeholder="e.g. Introduction to React"
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }} disabled={isSaving}>
                {isSaving ? '⏳ Creating...' : '✅ Create Module'}
              </button>
              {modules.length > 0 && (
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Created in this session:</p>
                  {modules.map(m => (
                    <div key={m.id} style={{ background: '#f0fdf4', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>📦 {m.title}</div>
                  ))}
                </div>
              )}
            </form>
          )}

          {activeTab === 'lesson' && (
            <form onSubmit={handleCreateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {modules.length === 0 && (
                <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', fontSize: '0.9rem', color: '#92400e', border: '1px solid #fde68a' }}>
                  ⚠️ Create at least one module first before adding lessons.
                </div>
              )}
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Select Module *</label>
                <select value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} required>
                  <option value="">-- Choose a module --</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Lesson Title *</label>
                <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="e.g. Getting Started with Components" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} required />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Video URL</label>
                <input type="url" value={lessonVideoUrl} onChange={e => setLessonVideoUrl(e.target.value)} placeholder="https://youtube.com/..." style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Lesson Notes / Content</label>
                <textarea value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder="Add notes or description for this lesson..." rows={3} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', fontSize: '1rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }} disabled={isSaving}>
                {isSaving ? '⏳ Saving...' : '📝 Add Lesson'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseModuleManager;
