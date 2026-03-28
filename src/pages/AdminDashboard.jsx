import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesApi, enrollmentsApi, paymentsApi, responseUtils } from '../api/lmsApi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

// Helper to normalize category definitions
const normalizeCategories = (payload) => {
  const rawItems = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : Array.isArray(payload?.categories) ? payload.categories : [];
  return rawItems.map((item) => {
    if (typeof item === 'string') return { id: item, name: item };
    if (!item || typeof item !== 'object') return null;
    const id = item.id || item.uuid || item.slug || item.name;
    const name = item.name || item.title || String(id || '');
    if (!id || !name) return null;
    return { id: String(id), name: String(name) };
  }).filter(Boolean);
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, courses, enrollments, payments
  const [stats, setStats] = useState({ total_users: 0, total_courses: 0, total_enrollments: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form & action states
  const [newCatName, setNewCatName] = useState('');
  const [isPublishingMap, setIsPublishingMap] = useState({});
  const [isDeletingMap, setIsDeletingMap] = useState({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [coursesRes, enrollmentsRes, categoriesRes, paymentsRes, usersRes] = await Promise.allSettled([
          coursesApi.list(),
          enrollmentsApi.list(),
          coursesApi.categories(),
          paymentsApi.list(),
          api.get('/users/').catch(() => null) // Attempt to fetch users if endpoint exists
        ]);

        const loadedCourses = coursesRes.status === 'fulfilled' ? responseUtils.toArray(coursesRes.value.data) : [];
        const loadedEnrolls = enrollmentsRes.status === 'fulfilled' ? responseUtils.toArray(enrollmentsRes.value.data) : [];
        const loadedPayments = paymentsRes.status === 'fulfilled' ? responseUtils.toArray(paymentsRes.value.data) : [];
        const loadedUsers = usersRes.status === 'fulfilled' && usersRes.value ? responseUtils.toArray(usersRes.value.data) : [
          { id: 1, email: 'admin@learnhub.com', role: 'admin' },
          { id: 2, email: 'instructor@learnhub.com', role: 'instructor' }
        ];

        setCourses(loadedCourses);
        setEnrollments(loadedEnrolls);
        setPayments(loadedPayments);
        setUsers(loadedUsers);

        if (categoriesRes.status === 'fulfilled') {
          setCategories(normalizeCategories(categoriesRes.value.data));
        }

        const totalRev = loadedPayments.reduce((sum, p) => sum + parseFloat(p.amount || p.price || 0), 0);

        setStats({
          total_users: loadedUsers.length || 'N/A',
          total_courses: responseUtils.toCount(loadedCourses),
          total_enrollments: responseUtils.toCount(loadedEnrolls),
          revenue: `$${totalRev.toFixed(2)}`,
        });
      } catch (err) {
        showToast('Failed to load full admin data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Actions
  const handleTogglePublish = async (course) => {
    const nextStatus = !course.is_published;
    setIsPublishingMap(p => ({ ...p, [course.id]: true }));
    try {
      await coursesApi.setPublishStatus(course.id, nextStatus);
      setCourses(p => p.map(c => c.id === course.id ? { ...c, is_published: nextStatus } : c));
      showToast(`Course ${nextStatus ? 'approved and published' : 'moved to draft'}.`, 'success');
    } catch (err) {
      showToast('Failed to change course status.', 'error');
    } finally {
      setIsPublishingMap(p => ({ ...p, [course.id]: false }));
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Absolutely sure you want to delete this course?')) return;
    setIsDeletingMap(p => ({ ...p, [`course_${id}`]: true }));
    try {
      await api.delete(`/courses/${id}/delete/`).catch(() => api.delete(`/courses/${id}/`));
      setCourses(p => p.filter(c => c.id !== id));
      showToast('Course deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete course.', 'error');
    } finally {
      setIsDeletingMap(p => ({ ...p, [`course_${id}`]: false }));
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await coursesApi.createCategory({ name: newCatName.trim() });
      setNewCatName('');
      const categoriesRes = await coursesApi.categories();
      setCategories(normalizeCategories(categoriesRes.data));
      showToast('Category created.', 'success');
    } catch (err) {
      showToast('Failed to create category.', 'error');
    }
  };

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    setIsDeletingMap(p => ({ ...p, [`enroll_${id}`]: true }));
    try {
      await enrollmentsApi.deleteEnrollment(id);
      setEnrollments(p => p.filter(e => e.id !== id));
      showToast('Enrollment removed.', 'success');
    } catch (err) {
      showToast('Failed to delete enrollment.', 'error');
    } finally {
      setIsDeletingMap(p => ({ ...p, [`enroll_${id}`]: false }));
    }
  };

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading Admin Console...</h2></div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>System Administrator</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.75rem', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>Admin Console</h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manage users, content, enrollments, and system oversight.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '📊 System Overview' },
          { id: 'users', label: '👥 User Management' },
          { id: 'courses', label: '📚 Course Moderation' },
          { id: 'enrollments', label: '✍️ Enrollments' },
          { id: 'payments', label: '💳 Payments' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '0.75rem 1.5rem', background: activeTab === tab.id ? '#111827' : 'transparent', color: activeTab === tab.id ? 'white' : '#6b7280', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.total_users, bg: '#eff6ff', color: '#3b82f6' },
              { label: 'Live Courses', value: stats.total_courses, bg: '#ecfdf5', color: '#10b981' },
              { label: 'Total Enrollments', value: stats.total_enrollments, bg: '#fef3c7', color: '#f59e0b' },
              { label: 'Gross Revenue', value: stats.revenue, bg: '#fdf2f8', color: '#ec4899' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, padding: '1.5rem', borderRadius: '20px', border: `1px solid ${s.color}20` }}>
                <div style={{ color: s.color, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ color: '#111827', fontWeight: 800, fontSize: '2.5rem', marginTop: '0.2rem' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="admin-main-grid">
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Pending Course Approvals</h3>
              {courses.filter(c => !c.is_published).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '16px', color: '#6b7280' }}>No pending courses.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {courses.filter(c => !c.is_published).slice(0, 5).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{c.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Instructor: {c.instructor}</div>
                      </div>
                      <button onClick={() => handleTogglePublish(c)} disabled={isPublishingMap[c.id]} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                        {isPublishingMap[c.id] ? '...' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Course Categories</h3>
              <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category..." style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', border: '2px solid #e5e7eb', outline: 'none' }} />
                <button type="submit" style={{ background: '#111827', color: 'white', padding: '0 1rem', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Add</button>
              </form>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {categories.map(c => <span key={c.id} style={{ background: '#f3f4f6', color: '#374151', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>{c.name}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div className="animate-fade-in" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Platform Users</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Email / Username</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>#{u.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{u.email || u.username || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: u.role === 'admin' ? '#ef4444' : u.role === 'instructor' ? '#3b82f6' : '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {String(u.role || 'student').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', marginRight: '1rem' }}>Edit Role</button>
                    <button style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Courses Tab ── */}
      {activeTab === 'courses' && (
        <div className="animate-fade-in" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Course Moderation</h3>
            <button onClick={() => navigate('/courses/create')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>+ Create Course</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Content</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>By Instructor {c.instructor}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: c.is_published ? '#ecfdf5' : '#fef3c7', color: c.is_published ? '#059669' : '#b45309', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {c.is_published ? 'Published' : 'Pending Approval'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => navigate(`/instructor/courses/${c.id}/content`)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Manage Modules
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleTogglePublish(c)} disabled={isPublishingMap[c.id]} style={{ background: 'none', border: '2px solid #e5e7eb', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      {c.is_published ? 'Unpublish' : 'Approve'}
                    </button>
                    <button onClick={() => handleDeleteCourse(c.id)} disabled={isDeletingMap[`course_${c.id}`]} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Enrollments Tab ── */}
      {activeTab === 'enrollments' && (
        <div className="animate-fade-in" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>All Enrollments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Student UUID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Progress</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>#{e.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{String(e.student || '').slice(0, 8)}...</td>
                  <td style={{ padding: '1rem' }}>{String(e.course || '').slice(0, 15)}...</td>
                  <td style={{ padding: '1rem' }}><span style={{ color: '#10b981', fontWeight: 700 }}>{Math.round(e.progress || 0)}%</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteEnrollment(e.id)} disabled={isDeletingMap[`enroll_${e.id}`]} style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Revoke Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Payments Tab ── */}
      {activeTab === 'payments' && (
        <div className="animate-fade-in" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem' }}>Payment Transactions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Course</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No transactions recorded yet.</td></tr>
              ) : payments.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>#{p.id || i}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.user || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}>{p.course}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>${p.amount || p.price}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}><span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>COMPLETED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
