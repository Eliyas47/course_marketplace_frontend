import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const StudentDashboard = ({ topPadding = '140px' }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, profileRes] = await Promise.all([
          api.get('/enrollments/my-courses/'),
          api.get('/auth/profile/')
        ]);
        // Backend returns results in a results array for paginated endpoints
        setMyCourses(coursesRes.data.results || coursesRes.data || []);
        setProfile(profileRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        showToast('Unable to load your courses. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading your dashboard...</h2></div>;

  return (
    <div className="container dashboard-page" style={{ paddingTop: topPadding, paddingBottom: '100px' }}>
      <div className="dashboard-header flex justify-between items-end mb-12">
        <div>
          <span className="badge">Welcome back, {profile?.username} 👋</span>
          <h1 className="mt-2">My Learning Dashboard</h1>
        </div>
        <div className="dashboard-actions flex gap-4">
          <Link to="/courses" className="btn btn-outline">Explore More</Link>
          <Link to="/profile" className="btn btn-primary">Edit Profile</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <main>
          <h3 className="mb-6">Enrolled Courses ({myCourses.length})</h3>
          {myCourses.length > 0 ? (
            <div className="grid-courses" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {myCourses.map(enrollment => (
                <div key={enrollment.id} className="course-card glass glass-hover">
                  <div className="course-image">
                    <img src={enrollment.course_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop'} alt={enrollment.course_title} />
                  </div>
                  <div className="course-info">
                    <h3 style={{ fontSize: '1.1rem' }}>{enrollment.course_title}</h3>
                    <div className="progress-container mt-4 mb-4">
                      <div className="flex justify-between text-xs mb-2 text-text-muted">
                        <span>Overall Progress</span>
                        <span>{enrollment.progress_percentage || 0}%</span>
                      </div>
                      <div className="progress-bar-bg glass" style={{ height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="progress-bar-fill" style={{ width: `${enrollment.progress_percentage || 0}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }} />
                      </div>
                    </div>
                    <Link to={`/learn/${enrollment.course_id}`} className="btn btn-primary w-full py-2">Continue Learning</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 text-center rounded-3xl">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h3>No courses yet</h3>
              <p className="text-text-muted mb-8">You haven't enrolled in any courses yet. Start your journey today!</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          )}
        </main>

        <aside className="dashboard-sidebar">
          <div className="glass p-6 rounded-2xl mb-8">
            <h4 className="mb-4">My Learning Stats</h4>
            <div className="flex flex-col gap-6">
              <div className="stat-item">
                <div className="text-text-muted text-sm decoration-gray-400">Courses in Progress</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{myCourses.filter(c => c.progress_percentage < 100).length}</div>
              </div>
              <div className="stat-item">
                <div className="text-text-muted text-sm">Completed Courses</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{myCourses.filter(c => c.progress_percentage === 100).length}</div>
              </div>
              <div className="stat-item">
                <div className="text-text-muted text-sm">Certificates Earned</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>0</div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h4 className="mb-4">Recent Activity</h4>
            <p className="text-sm text-text-muted">No recent activity found.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
