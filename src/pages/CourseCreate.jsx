import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const RECOMMENDED_CATEGORY_NAMES = ['Development', 'Business', 'Design', 'Marketing', 'Data Science', 'AI & Machine Learning', 'Photography', 'Music'];
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const slugify = (value) => String(value || '').trim().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const isLikelyBackendCategoryId = (value) => {
  const v = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) || /^\d+$/.test(v);
};
const normalizeCategories = (data) => {
  const rawItems = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.categories) ? data.categories : [];
  const normalized = rawItems.map(item => {
    if (typeof item === 'string') return { id: item, name: item, isBackendCategory: false };
    if (!item || typeof item !== 'object') return null;
    const id = item.id || item.uuid || item.slug || item.name;
    const name = item.name || item.title || String(id || '');
    if (!id || !name) return null;
    return { id: String(id), name: String(name), isBackendCategory: isLikelyBackendCategoryId(id) };
  }).filter(Boolean);
  const uniqueById = new Map();
  normalized.forEach(cat => { if (!uniqueById.has(cat.id)) uniqueById.set(cat.id, cat); });
  const unique = [...uniqueById.values()];
  unique.sort((a, b) => {
    const aR = RECOMMENDED_CATEGORY_NAMES.some(n => slugify(n) === slugify(a.name));
    const bR = RECOMMENDED_CATEGORY_NAMES.some(n => slugify(n) === slugify(b.name));
    return aR !== bR ? (aR ? -1 : 1) : a.name.localeCompare(b.name);
  });
  return unique;
};
const getFallbackCategories = () => RECOMMENDED_CATEGORY_NAMES.map(name => ({ id: slugify(name), name, isBackendCategory: false }));
const inferCategoriesFromCourses = (payload) => {
  const courses = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];
  const byId = new Map();
  courses.forEach(course => {
    const rawCategory = course?.category;
    const id = rawCategory?.id || rawCategory?.uuid || rawCategory;
    if (!isLikelyBackendCategoryId(id)) return;
    const name = course?.category_name || rawCategory?.name || String(id);
    if (!byId.has(String(id))) byId.set(String(id), { id: String(id), name: String(name), isBackendCategory: true });
  });
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};
const getCreateCourseErrorMessage = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Failed to create course. Please check all fields.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const fieldErrors = Object.entries(data).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`).filter(Boolean);
  return fieldErrors[0] || 'Failed to create course. Please check all fields.';
};

const STEPS = ['Basic Info', 'Details', 'Thumbnail'];

const CourseCreate = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', categoryId: '', level: 'Beginner', price: '0.00', thumbnail: null });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const hasBackendCategories = categories.some(c => c.isBackendCategory);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await coursesApi.categories();
        const normalized = normalizeCategories(response.data);
        if (normalized.some(cat => cat.isBackendCategory)) { setCategories(normalized); return; }
        const coursesRes = await coursesApi.list();
        const inferred = inferCategoriesFromCourses(coursesRes.data);
        setCategories(inferred.length ? inferred : getFallbackCategories());
      } catch {
        try {
          const coursesRes = await coursesApi.list();
          const inferred = inferCategoriesFromCourses(coursesRes.data);
          setCategories(inferred.length ? inferred : getFallbackCategories());
        } catch { setCategories(getFallbackCategories()); }
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, thumbnail: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resolvedCategoryId = isLikelyBackendCategoryId(formData.category) ? formData.category : formData.categoryId;
      if (!isLikelyBackendCategoryId(resolvedCategoryId)) {
        showToast('Please choose a valid category loaded from the backend.', 'warning');
        setIsLoading(false);
        return;
      }
      if (!formData.thumbnail) {
        showToast('Please upload a course thumbnail image.', 'warning');
        setIsLoading(false);
        return;
      }
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('level', formData.level);
      payload.append('price', String(formData.price));
      payload.append('category', String(resolvedCategoryId).trim());
      payload.append('is_published', 'false');
      payload.append('thumbnail', formData.thumbnail);
      await coursesApi.create(payload);
      showToast('🎉 Course created successfully! You can now add modules and lessons.', 'success');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Course creation failed:', err.response?.data);
      showToast(getCreateCourseErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '1rem 1.1rem', borderRadius: '14px', border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#111827', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' };
  const labelStyle = { fontWeight: 700, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' };
  const focusHandler = e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)'; e.target.style.background = 'white'; };
  const blurHandler = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafafa'; };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 30%, #fdf4ff 100%)' }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', paddingTop: '110px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.2rem' }}>
            <span>✨</span>
            <span style={{ color: '#86efac', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Knowledge Creator</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Create Your Course</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6 }}>Share your expertise with thousands of eager learners worldwide. Start earning today.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Step Indicator */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '3rem', background: 'white', borderRadius: '20px', padding: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} style={{ flex: 1, padding: '0.9rem 1rem', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: step === i ? 700 : 600, fontSize: '0.95rem', background: step === i ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', color: step === i ? 'white' : '#6b7280', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === i ? 'rgba(255,255,255,0.25)' : i < step ? '#10b981' : '#e5e7eb', color: step === i ? 'white' : i < step ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(16,185,129,0.25)' }}>📝</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Basic Information</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Tell learners what your course is about</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <div>
                    <label style={labelStyle}>Course Title <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} placeholder="e.g. Complete React Developer Course — Zero to Mastery" required />
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.4rem' }}>Your title is the first impression. Make it compelling and specific.</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Course Description <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea name="description" value={formData.description} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} rows={6} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="Describe what students will learn, what skills they'll gain, who this course is for, and what prerequisites are needed..." required />
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.4rem' }}>Minimum 200 characters recommended for better discovery.</p>
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { if (!formData.title.trim() || !formData.description.trim()) { showToast('Please fill in the title and description.', 'warning'); return; } setStep(1); }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px rgba(16,185,129,0.25)' }}>
                    Continue <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(99,102,241,0.25)' }}>⚙️</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Course Settings</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Set category, difficulty, and pricing</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} style={{ ...inputStyle, cursor: 'pointer' }} required>
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} disabled={!cat.isBackendCategory}>
                          {cat.name}{!cat.isBackendCategory ? ' (not available)' : ''}
                        </option>
                      ))}
                    </select>
                    {!hasBackendCategories && (
                      <div style={{ marginTop: '1rem' }}>
                        <label style={labelStyle}>Category UUID (from admin)</label>
                        <input type="text" name="categoryId" value={formData.categoryId} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Difficulty Level <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="level" value={formData.level} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} style={{ ...inputStyle, cursor: 'pointer' }} required>
                      {LEVEL_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Price (USD)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700, fontSize: '1.1rem' }}>$</div>
                      <input type="number" name="price" step="0.01" min="0" value={formData.price} onChange={handleChange} onFocus={focusHandler} onBlur={blurHandler} style={{ ...inputStyle, paddingLeft: '2.2rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {['0.00', '9.99', '19.99', '49.99', '99.99'].map(p => (
                        <button key={p} type="button" onClick={() => setFormData(prev => ({ ...prev, price: p }))} style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '2px solid', borderColor: formData.price === p ? '#10b981' : '#e5e7eb', background: formData.price === p ? '#ecfdf5' : 'white', color: formData.price === p ? '#065f46' : '#6b7280', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {p === '0.00' ? 'Free' : `$${p}`}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.4rem' }}>Set to 0 for a free course. You can change the price after publication.</p>
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(0)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '14px', padding: '1rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                  <button type="button" onClick={() => setStep(2)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(99,102,241,0.25)' }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Thumbnail */}
            {step === 2 && (
              <div style={{ background: 'white', borderRadius: '28px', padding: '3rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #ec4899, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(236,72,153,0.25)' }}>🖼️</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Course Thumbnail</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>A great image makes your course stand out</p>
                  </div>
                </div>

                {/* Image Upload Area */}
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ border: '2px dashed #d1d5db', borderRadius: '20px', padding: '3rem', textAlign: 'center', background: thumbnailPreview ? 'transparent' : '#fafafa', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={e => { if (!thumbnailPreview) e.currentTarget.style.borderColor = '#d1d5db'; }}>
                    {thumbnailPreview ? (
                      <div style={{ position: 'relative' }}>
                        <img src={thumbnailPreview} alt="Preview" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '14px' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151', marginBottom: '0.5rem' }}>Drag & drop or click to upload</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Supports JPG, PNG, GIF — Max 10MB</div>
                        <div style={{ marginTop: '1.5rem', display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '12px', padding: '0.7rem 2rem', fontWeight: 700, fontSize: '0.95rem' }}>Choose File</div>
                      </>
                    )}
                  </div>
                  <input type="file" name="thumbnail" accept="image/*" onChange={handleThumbnailChange} style={{ display: 'none' }} required />
                </label>

                <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
                  <p style={{ color: '#92400e', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                    <strong>Pro tip:</strong> Use a crisp, high-resolution image (1280×720px minimum). Clean visuals with minimal text and bold colors get up to 3× more clicks.
                  </p>
                </div>

                {/* Summary */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '18px', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <h4 style={{ margin: '0 0 1rem', color: '#065f46', fontSize: '1rem' }}>📋 Course Summary</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Title', val: formData.title || '—' },
                      { label: 'Level', val: formData.level },
                      { label: 'Price', val: formData.price === '0.00' ? 'Free' : `$${formData.price}` },
                      { label: 'Category', val: categories.find(c => c.id === formData.category)?.name || '—' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'white', borderRadius: '10px', padding: '0.7rem 1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '14px', padding: '1rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                  <button type="submit" disabled={isLoading} style={{ background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '14px', padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: isLoading ? 'none' : '0 8px 20px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
                    {isLoading ? (
                      <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Creating Course...</>
                    ) : (
                      <><span>🚀</span> Create Course Draft</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
