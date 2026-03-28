import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const normalizeCategoryNames = (data) => {
  const rawItems = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.categories) ? data.categories : [];
  return rawItems.map(item => {
    if (typeof item === 'string') return item;
    if (!item || typeof item !== 'object') return '';
    return String(item.name || item.title || item.slug || '').trim();
  }).filter(Boolean);
};

const LEVEL_ICONS = { Beginner: '🌱', Intermediate: '⚡', Advanced: '🔥', default: '📚' };

const CourseListing = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
  });
  const [categories, setCategories] = useState([]);
  const fallbackCategories = ['Development', 'Business', 'Design', 'Marketing', 'Photography', 'Music'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catsRes = await api.get('/courses/categories/');
        setCategories(normalizeCategoryNames(catsRes.data));
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.level) params.level = filters.level;
        const response = await api.get('/courses/', { params });
        let fetchedCourses = response.data.results || response.data || [];
        
        // Strict client-side filtering fallback since backend might ignore query params
        if (filters.level) {
          fetchedCourses = fetchedCourses.filter(c => c.level === filters.level);
        }
        if (filters.category) {
          fetchedCourses = fetchedCourses.filter(c => 
            c.category_name === filters.category || c.category === filters.category
          );
        }
        if (filters.search) {
          const s = filters.search.toLowerCase();
          fetchedCourses = fetchedCourses.filter(c => 
            c.title?.toLowerCase().includes(s) || 
            c.description?.toLowerCase().includes(s)
          );
        }
        
        setCourses(fetchedCourses);
      } catch (err) {
        console.error('Failed to fetch filtered courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilteredCourses();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    const newSearchParams = new URLSearchParams();
    if (nextFilters.search) newSearchParams.set('search', nextFilters.search);
    if (nextFilters.category) newSearchParams.set('category', nextFilters.category);
    if (nextFilters.level) newSearchParams.set('level', nextFilters.level);
    if (value) newSearchParams.set(name, value); else newSearchParams.delete(name);
    setSearchParams(newSearchParams);
  };

  const categoryOptions = ['All', ...(categories.length ? categories : fallbackCategories)];
  const hasActiveFilters = filters.search || filters.category || filters.level;

  return (
    <div className="animate-fade-in">
      {/* ─── Hero Banner ─── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        paddingTop: '120px',
        paddingBottom: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-60px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.2rem' }}>
                <span>📚</span>
                <span style={{ color: '#86efac', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Courses</span>
              </div>
              <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                Explore <span style={{ background: 'linear-gradient(90deg, #34d399, #10b981)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>World-Class</span> Courses
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: '480px', lineHeight: 1.6 }}>
                Learn from industry experts. Advance your skills with hands-on projects.
              </p>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.1rem' }}>🔍</div>
              <input
                type="text"
                placeholder="Search for anything..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(8px)', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Filter Chips Row ─── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', position: 'sticky', top: '80px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div className="container" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6b7280', marginRight: '0.5rem' }}>Category:</span>
          {categoryOptions.map(cat => {
            const active = (cat === 'All' && !filters.category) || filters.category === cat;
            return (
              <button key={cat} onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat)} style={{ padding: '0.45rem 1.1rem', borderRadius: '999px', border: '2px solid', borderColor: active ? '#10b981' : '#e5e7eb', background: active ? '#ecfdf5' : 'white', color: active ? '#065f46' : '#6b7280', fontWeight: active ? 700 : 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </button>
            );
          })}
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6b7280', margin: '0 0.25rem 0 1rem' }}>Level:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => {
            const active = (lvl === 'All' && !filters.level) || filters.level === lvl;
            return (
              <button key={lvl} onClick={() => handleFilterChange('level', lvl === 'All' ? '' : lvl)} style={{ padding: '0.45rem 1.1rem', borderRadius: '999px', border: '2px solid', borderColor: active ? '#6366f1' : '#e5e7eb', background: active ? '#eff6ff' : 'white', color: active ? '#4338ca' : '#6b7280', fontWeight: active ? 700 : 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {LEVEL_ICONS[lvl] || ''} {lvl}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button onClick={() => { setFilters({ search: '', category: '', level: '' }); setSearchParams({}); }} style={{ padding: '0.45rem 1.1rem', borderRadius: '999px', border: '2px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}>
              ✕ Clear All
            </button>
          )}
        </div>
      </div>

      {/* ─── Course Grid ─── */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        {/* Results count */}
        {!isLoading && (
          <div style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: 600 }}>
            {courses.length > 0 ? `Showing ${courses.length} course${courses.length !== 1 ? 's' : ''}` : ''}
            {filters.category && <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>in {filters.category}</span>}
          </div>
        )}

        {isLoading ? (
          <div className="grid-courses stagger">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton animate-fade-in" style={{ height: '340px', borderRadius: '24px' }} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid-courses stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {courses.map((course, idx) => (
              <Link
                to={`/courses/${course.id}`}
                key={course.id}
                className="animate-fade-in"
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  animationDelay: `${idx * 0.07}s`,
                  animationFillMode: 'both',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-8px)';
                  el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                  el.style.borderColor = '#10b981';
                  el.querySelector('img').style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                  el.style.borderColor = '#e5e7eb';
                  el.querySelector('img').style.transform = 'scale(1)';
                }}
              >
                {/* Image */}
                <div style={{ height: '190px', position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                  <img
                    src={course.thumbnail || course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop'}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                  {course.category_name && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(16,185,129,0.9)', color: 'white', borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                      {course.category_name}
                    </span>
                  )}
                  {course.level && (
                    <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>
                      {LEVEL_ICONS[course.level] || '📚'} {course.level}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.6rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {course.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#6b7280' }}>
                    <span>⭐ <strong style={{ color: '#111' }}>{course.average_rating || '4.8'}</strong></span>
                    <span>👥 {course.enrolled_count || course.enrolled_students || '0'} students</span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                      {parseFloat(course.price || 0) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '0.35rem 0.85rem', borderRadius: '999px' }}>
                      Enroll →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '32px', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>No courses found</h3>
            <p style={{ color: '#9ca3af', fontSize: '1.05rem', marginBottom: '2rem' }}>Try adjusting your filters or search terms.</p>
            <button onClick={() => { setFilters({ search: '', category: '', level: '' }); setSearchParams({}); }} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseListing;
