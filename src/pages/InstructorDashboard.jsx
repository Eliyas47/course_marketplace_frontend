import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, coursesApi, responseUtils } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';
import './InstructorDashboard.css';

const InstructorDashboard = ({ topPadding = '140px' }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const [dashboardRes, profileRes] = await Promise.all([
          coursesApi.dashboard(),
          authApi.getProfile(),
        ]);

        const dashboardPayload = dashboardRes.data;
        const userId = profileRes.data?.id;

        const fromDashboard = Array.isArray(dashboardPayload)
          ? dashboardPayload
          : Array.isArray(dashboardPayload?.results)
            ? dashboardPayload.results
            : Array.isArray(dashboardPayload?.courses)
              ? dashboardPayload.courses
              : Array.isArray(dashboardPayload?.my_courses)
                ? dashboardPayload.my_courses
                : [];

        if (fromDashboard.length > 0) {
          setCourses(fromDashboard);
          return;
        }

        const coursesRes = await coursesApi.list();
        const fallbackCourses = responseUtils
          .toArray(coursesRes.data)
          .filter((course) => String(course.instructor || '') === String(userId || ''));
        setCourses(fallbackCourses);
      } catch (err) {
        console.error('Failed to fetch instructor dashboard data:', err);
        showToast('Unable to load dashboard data. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructorCourses();
  }, []);

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await coursesApi.update(courseId, { is_published: !currentStatus });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !currentStatus } : c));
      showToast(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`, 'success');
    } catch (err) {
      console.error('Failed to toggle publication status:', err);
      showToast('Action failed. Please check your permissions.', 'error');
    }
  };

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading instructor dashboard...</h2></div>;

  return (
    <div className="container dashboard-page animate-fade-in" style={{ paddingTop: topPadding, paddingBottom: '100px' }}>
      <div className="instructor-dashboard mb-12">
        <div className="dashboard-header flex justify-between items-end gap-6" style={{ flexWrap: 'wrap' }}>
          <div>
            <span className="badge premium-badge">Instructor Control Center</span>
            <h1 className="mt-4 text-5xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              Welcome Back,<br/><span className="text-gradient">Instructor</span>
            </h1>
            <p className="text-text-muted mt-4 max-w-md text-lg">Manage your courses, track student progress, and grow your teaching business.</p>
          </div>
          <div className="dashboard-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/courses/create" className="btn btn-primary" style={{ padding: '1.1rem 2rem', fontSize: '1rem', borderRadius: '16px' }}>
              ✨ Create Course
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <main>
          <div className="flex justify-between items-center mb-8">
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>My Courses <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>({courses.length})</span></h3>
          </div>
          
          {courses.length > 0 ? (
            <div className="grid-courses" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {courses.map(course => (
                <div key={course.id} className="course-card premium-course-card overflow-hidden" style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                  {/* Image */}
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden', background: '#f3f4f6' }}>
                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                    <span style={{ position: 'absolute', top: '14px', right: '14px', background: course.is_published ? '#10b981' : '#f59e0b', color: 'white', borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.72rem', fontWeight: 800 }}>
                      {course.is_published ? '✅ Published' : '📝 Draft'}
                    </span>
                    <h4 style={{ position: 'absolute', bottom: '14px', left: '18px', right: '18px', color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      {course.title}
                    </h4>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>${course.price || '0'}</span>
                      <span style={{ background: '#f3f4f6', color: '#4b5563', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}>
                        ⭐ {course.average_rating || 'New'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                      <Link to={`/courses/${course.id}/edit`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', borderRadius: '12px', border: '2px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                        ✏️ Edit
                      </Link>
                      <button onClick={() => handleTogglePublish(course.id, course.is_published)} style={{ padding: '0.7rem', borderRadius: '12px', border: '2px solid', borderColor: course.is_published ? '#fde68a' : '#10b981', background: course.is_published ? '#fef3c7' : '#ecfdf5', color: course.is_published ? '#92400e' : '#065f46', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                        {course.is_published ? '⏸ Unpublish' : '🚀 Publish'}
                      </button>
                    </div>

                    {/* Content manager button — full width, prominent */}
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/content`)}
                      style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(99,102,241,0.2)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      📦 Manage Modules & Lessons
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-stat-card p-12 text-center rounded-3xl" style={{ marginTop: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'inline-block', animation: 'fadeIn 1s ease' }}>🚀</div>
              <h3 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Start your journey as an instructor</h3>
              <p className="text-text-muted mb-8" style={{ fontSize: '1.1rem', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: 1.6 }}>Ready to share your knowledge with the world? Create your first course today and start earning.</p>
              <Link to="/courses/create" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.15rem', borderRadius: '18px' }}>Create Your First Course</Link>
            </div>
          )}
        </main>
        
        <aside>
          <div className="premium-stat-card p-8 rounded-3xl mb-8">
            <h4 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Quick Stats</h4>
            <div className="flex flex-col gap-5 mt-6">
              {[
                { icon: '📚', label: 'Active Courses', value: courses.filter(c => c.is_published).length, color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
                { icon: '📝', label: 'Drafts', value: courses.filter(c => !c.is_published).length, color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
                { icon: '📦', label: 'Total Courses', value: courses.length, color: '#6366f1', bg: 'rgba(99,102,241,0.05)' },
              ].map(s => (
                <div key={s.label} className="stat-item flex items-center gap-5 p-5 rounded-2xl" style={{ background: s.bg }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${s.color}cc, ${s.color})`, color: 'white', fontSize: '1.4rem', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#111827' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-stat-card p-8 rounded-3xl">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>⚡ Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { icon: '✨', label: 'Create New Course', to: '/courses/create', color: '#10b981' },
                { icon: '👁️', label: 'Preview My Courses', to: '/courses', color: '#6366f1' },
                { icon: '🏅', label: 'My Certificates', to: '/certificates', color: '#f59e0b' },
                { icon: '⚙️', label: 'Profile Settings', to: '/settings', color: '#ec4899' },
              ].map(a => (
                <Link key={a.label} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px', background: '#f9fafb', textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = `${a.color}30`; e.currentTarget.style.color = a.color; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                  <span style={{ fontSize: '1.1rem' }}>{a.icon}</span> {a.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InstructorDashboard;
