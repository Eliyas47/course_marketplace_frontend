import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi, enrollmentsApi, certificatesApi, responseUtils } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const mapEnrollment = (enrollment) => {
  const nestedCourse = enrollment?.course || {};
  const progressValue = Number(enrollment?.progress ?? enrollment?.progress_percentage ?? 0);
  return {
    id: enrollment?.id,
    course_id: nestedCourse?.id || enrollment?.course_id || enrollment?.course,
    course_title: nestedCourse?.title || enrollment?.course_title || 'Untitled Course',
    course_image: nestedCourse?.thumbnail || enrollment?.course_image || '',
    course_level: nestedCourse?.level || enrollment?.level || '',
    progress_percentage: Number.isFinite(progressValue) ? Math.min(Math.max(progressValue, 0), 100) : 0,
  };
};

const StudentDashboard = ({ topPadding = '140px' }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, profileRes, certsRes] = await Promise.allSettled([
          enrollmentsApi.myCourses(),
          authApi.getProfile(),
          certificatesApi.myCertificates(),
        ]);

        if (coursesRes.status === 'fulfilled') {
          setMyCourses(responseUtils.toArray(coursesRes.value.data).map(mapEnrollment));
        }
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        }
        if (certsRes.status === 'fulfilled') {
          setCertificates(responseUtils.toArray(certsRes.value.data));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        showToast('Unable to load your dashboard. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🎓</div>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  const inProgress = myCourses.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100);
  const completed = myCourses.filter(c => c.progress_percentage >= 100);
  const notStarted = myCourses.filter(c => c.progress_percentage === 0);

  const stats = [
    { label: 'Enrolled', value: myCourses.length, icon: '📚', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'In Progress', value: inProgress.length, icon: '⚡', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    { label: 'Completed', value: completed.length, icon: '✅', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Certificates', value: certificates.length, icon: '🏆', color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  ];

  return (
    <div className="container dashboard-page animate-fade-in" style={{ paddingTop: topPadding, paddingBottom: '100px' }}>
      {/* Hero Header */}
      <div className="glass rounded-3xl p-10 mb-10" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', border: '1px solid rgba(16,185,129,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="flex items-center gap-6">
            <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 800, boxShadow: '0 12px 30px rgba(16,185,129,0.3)' }}>
              {profile?.username?.[0]?.toUpperCase() || '🎓'}
            </div>
            <div>
              <div className="badge" style={{ marginBottom: '0.5rem' }}>Student Dashboard</div>
              <h1 style={{ fontSize: '2.2rem', letterSpacing: '-0.02em', margin: 0 }}>
                Welcome back, <span className="text-gradient">{profile?.first_name || profile?.username || 'Learner'}</span>!
              </h1>
              <p className="text-text-muted" style={{ marginTop: '0.4rem' }}>
                {profile?.email} · Joined {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-outline" style={{ borderRadius: '14px' }}>🔍 Explore Courses</Link>
            <Link to="/profile" className="btn btn-primary" style={{ borderRadius: '14px' }}>✏️ Edit Profile</Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-grid" style={{ marginTop: '2.5rem' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: '20px', padding: '1.5rem', textAlign: 'center', transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <main>
          {/* In Progress Section */}
          {inProgress.length > 0 && (
            <div className="mb-10">
              <h3 className="mb-6" style={{ fontSize: '1.5rem' }}>⚡ Continue Learning</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inProgress.map(enrollment => (
                  <div key={enrollment.id} className="glass" style={{ borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                    <div style={{ width: '80px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={enrollment.course_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=200'} alt={enrollment.course_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{enrollment.course_title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${enrollment.progress_percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '4px', transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', minWidth: '40px' }}>{enrollment.progress_percentage}%</span>
                      </div>
                    </div>
                    <Link to={`/learn/${enrollment.course_id}`} className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.6rem 1.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>Continue →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Enrolled Courses */}
          <h3 className="mb-6" style={{ fontSize: '1.5rem' }}>📚 All Enrolled Courses ({myCourses.length})</h3>
          {myCourses.length > 0 ? (
            <div className="grid-courses" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {myCourses.map(enrollment => (
                <div key={enrollment.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    <img src={enrollment.course_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500'} alt={enrollment.course_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                    {enrollment.progress_percentage >= 100 && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>✅ Done</div>
                    )}
                  </div>
                  <div style={{ padding: '1.2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', lineHeight: 1.4 }}>{enrollment.course_title}</h4>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                        <span>Progress</span>
                        <span style={{ color: enrollment.progress_percentage >= 100 ? 'var(--primary)' : 'var(--text-main)' }}>{enrollment.progress_percentage}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                        <div style={{ width: `${enrollment.progress_percentage}%`, height: '100%', background: enrollment.progress_percentage >= 100 ? 'var(--primary)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '3px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                    <Link to={`/learn/${enrollment.course_id}`} className="btn btn-primary w-full" style={{ borderRadius: '12px', padding: '0.7rem' }}>
                      {enrollment.progress_percentage >= 100 ? '🔄 Review Course' : enrollment.progress_percentage > 0 ? '▶ Continue' : '🚀 Start Learning'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '32px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🎓</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your learning journey starts here</h3>
              <p className="text-text-muted" style={{ marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '420px', margin: '0 auto 2rem', lineHeight: 1.6 }}>Browse our expert-led courses and enroll in something amazing today!</p>
              <Link to="/courses" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '16px' }}>Explore Courses</Link>
            </div>
          )}
        </main>

        <aside className="dashboard-sidebar">
          {/* Learning Stats */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>📊 Learning Stats</h4>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Not Started', value: notStarted.length, color: '#6b7280' },
                { label: 'In Progress', value: inProgress.length, color: '#6366f1' },
                { label: 'Completed', value: completed.length, color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', background: '#f9fafb' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div style={{ background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 20px rgba(236,72,153,0.08)', marginBottom: '1.5rem', border: '1px solid rgba(236,72,153,0.1)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🏆 Certificates</h4>
            {certificates.length > 0 ? (
              <div className="flex flex-col gap-3">
                {certificates.slice(0, 3).map(cert => (
                  <div key={cert.id} style={{ background: 'white', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700 }}>Certificate #{cert.id}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Issued {new Date(cert.issued_at).toLocaleDateString()}</div>
                  </div>
                ))}
                <Link to="/certificates" className="btn btn-outline w-full" style={{ marginTop: '0.5rem', borderRadius: '12px', fontSize: '0.9rem' }}>View All Certificates</Link>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🎖️</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Complete courses to earn certificates</p>
                <Link to="/certificates" className="btn btn-outline w-full" style={{ borderRadius: '12px', fontSize: '0.85rem' }}>My Certificates</Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>🔗 Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Browse Courses', href: '/courses', icon: '📚' },
                { label: 'My Certificates', href: '/certificates', icon: '🏆' },
                { label: 'Edit Profile', href: '/profile', icon: '👤' },
                { label: 'Account Settings', href: '/settings', icon: '⚙️' },
              ].map(link => (
                <Link key={link.href} to={link.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', background: '#f9fafb', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.paddingLeft = '1.2rem'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.paddingLeft = '0.75rem'; }}>
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
