import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_courses: 0,
    total_enrollments: 0,
    revenue: 0
  });
  const [pendingCourses, setPendingCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Admin dashboards often have custom summary endpoints
        // For now, we'll fetch general lists if specific stats aren't available
        const [usersRes, coursesRes] = await Promise.all([
          api.get('/auth/profile/'), // Just to verify admin link works
          api.get('/courses/')
        ]);
        
        setPendingCourses((coursesRes.data.results || []).filter(c => !c.is_published));
        setStats({
          total_users: '...', // Placeholder until admin stats endpoint confirmed
          total_courses: coursesRes.data.count || coursesRes.data.length,
          total_enrollments: '...',
          revenue: '...'
        });
      } catch (err) {
        console.error('Admin Dashboard: Fetch failed', err);
        showToast('System overview data currently unavailable.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading admin panel...</h2></div>;

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="mb-12">
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>System Administrator</span>
        <h1 className="mt-2">Platform Overview</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: stats.total_users, icon: '👤' },
          { label: 'Live Courses', value: stats.total_courses, icon: '📚' },
          { label: 'Enrollments', value: stats.total_enrollments, icon: '✍️' },
          { label: 'Net Revenue', value: stats.revenue, icon: '💰' },
        ].map((item, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <div className="text-sm text-text-muted">{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass p-8 rounded-3xl">
            <h3 className="mb-6">Courses Awaiting Approval / Review</h3>
            {pendingCourses.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pendingCourses.map(course => (
                  <div key={course.id} className="glass p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div style={{ fontWeight: 700 }}>{course.title}</div>
                      <div className="text-xs text-text-muted">Instructor ID: {course.instructor}</div>
                    </div>
                    <button className="btn btn-primary text-xs py-2 px-4">Review Content</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No pending courses at the moment.</p>
            )}
          </div>
        </div>
        
        <aside>
          <div className="glass p-6 rounded-2xl mb-6">
            <h4>Admin Actions</h4>
            <div className="flex flex-col gap-3 mt-4">
              <button className="btn btn-outline w-full text-sm">Manage Users</button>
              <button className="btn btn-outline w-full text-sm">Platform Settings</button>
              <button className="btn btn-outline w-full text-sm">Export Reports</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
