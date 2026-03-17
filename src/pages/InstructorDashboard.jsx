import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const InstructorDashboard = ({ topPadding = '140px' }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        // Backend provides a dashboard endpoint for instructors
        const response = await api.get('/courses/dashboard/');
        // The dashboard endpoint likely returns a list or an object with results
        setCourses(Array.isArray(response.data) ? response.data : (response.data.results || []));
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
      await api.patch(`/courses/${courseId}/update/`, { is_published: !currentStatus });
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !currentStatus } : c));
      showToast(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully!`, 'success');
    } catch (err) {
      console.error('Failed to toggle publication status:', err);
      showToast('Action failed. Please check your permissions.', 'error');
    }
  };

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading instructor dashboard...</h2></div>;

  return (
    <div className="container dashboard-page" style={{ paddingTop: topPadding, paddingBottom: '100px' }}>
      <div className="dashboard-header flex justify-between items-end mb-12">
        <div>
          <span className="badge">Instructor Control Center</span>
          <h1 className="mt-2">Welcome Back, Instructor</h1>
        </div>
        <div className="dashboard-actions flex gap-4">
          <Link to="/courses/create" className="btn btn-primary">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Create New Course
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <main>
          <div className="flex justify-between items-center mb-8">
            <h3 style={{ margin: 0 }}>Manage My Courses ({courses.length})</h3>
          </div>
          
          {courses.length > 0 ? (
            <div className="grid-courses" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {courses.map(course => (
                <div key={course.id} className="course-card glass p-0 overflow-hidden">
                  <div className="course-image" style={{ height: '180px', position: 'relative' }}>
                    <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className={`badge`} style={{ position: 'absolute', top: '10px', right: '10px', background: course.is_published ? 'var(--success)' : 'var(--warning)', color: 'white', fontSize: '0.65rem', border: 'none' }}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="mb-2 line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-6">
                      <span className="flex items-center gap-1">💰 ${course.price}</span>
                      <span className="flex items-center gap-1">⭐ {course.average_rating || 'N/A'}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Link to={`/courses/${course.id}/edit`} className="btn btn-outline text-sm w-full">Edit Course</Link>
                      <button 
                        onClick={() => handleTogglePublish(course.id, course.is_published)}
                        className={`btn text-sm w-full ${course.is_published ? 'btn-outline' : 'btn-primary'}`}
                      >
                        {course.is_published ? 'Unpublish' : 'Publish Course'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 text-center rounded-3xl">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
              <h3>Start your journey as an instructor</h3>
              <p className="text-text-muted mb-8">Ready to share your knowledge? Create your first course today.</p>
              <Link to="/courses/create" className="btn btn-primary">Create Your First Course</Link>
            </div>
          )}
        </main>
        
        <aside>
          <div className="glass p-6 rounded-2xl mb-8">
            <h4>Quick Stats</h4>
            <div className="flex flex-col gap-6 mt-6">
              <div className="stat-item">
                <div className="text-sm text-text-muted">Active Courses</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.filter(c => c.is_published).length}</div>
              </div>
              <div className="stat-item">
                <div className="text-sm text-text-muted">Total Students</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>-</div>
              </div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <h4>Instructor Resources</h4>
            <div className="flex flex-col gap-3 mt-4">
              <a href="#" className="text-sm text-primary font-medium" style={{ textDecoration: 'none' }}>→ Teaching Guidelines</a>
              <a href="#" className="text-sm text-primary font-medium" style={{ textDecoration: 'none' }}>→ Content Policies</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InstructorDashboard;
