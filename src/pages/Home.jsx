import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

// Import Assets
import heroImg from '../assets/hero.png';
import devImg from '../assets/Development.jpg';
import bizImg from '../assets/Business.jpg';
import designImg from '../assets/graphics design.jpg';
import marketingImg from '../assets/Marketing.jpg';
import photoImg from '../assets/photography.jpg';
import musicImg from '../assets/Music.jpg';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: 'Development', img: devImg, icon: '💻', desc: 'Build modern websites and robust applications with cutting-edge tech.' },
    { name: 'Business', img: bizImg, icon: '📊', desc: 'Master leadership, finance, and entrepreneurship to scale your career.' },
    { name: 'Design', img: designImg, icon: '🎨', desc: 'Create stunning visuals and user-centric interfaces that stand out.' },
    { name: 'Marketing', img: marketingImg, icon: '📈', desc: 'Learn digital strategies to reach global audiences and drive growth.' },
    { name: 'Photography', img: photoImg, icon: '📸', desc: 'Capture breathtaking moments with professional lighting and editing.' },
    { name: 'Music', img: musicImg, icon: '🎸', desc: 'Produce, mix, and play your way to the top of the charts.' },
  ];

  const { showToast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/');
        // The endpoint is likely paginated, results are in .results
        setCourses(response.data.results || response.data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        showToast('Unable to load courses. Please try again later.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="home-container">
      {/* ─── Hero Section ─── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '100px', paddingBottom: '80px' }}>
          <div className="hero-content">
            {/* Left Text */}
            <div className="animate-fade-in-left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', padding: '0.5rem 1.25rem', marginBottom: '2rem' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                <span style={{ color: '#86efac', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Era of Learning</span>
              </div>

              <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '1.75rem', color: 'white' }}>
                Master Your Future<br />
                with{' '}
                <span style={{ background: 'linear-gradient(90deg, #34d399, #10b981, #059669)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'gradientShift 4s ease infinite' }}>
                  Expert-Led
                </span>
                <br />Courses
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '460px' }}>
                Join 25 million+ learners and start your journey today. Access over 5,000+ expert-crafted courses — from Web Dev to Personal Growth.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <Link to="/courses" className="btn btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem', borderRadius: '16px', boxShadow: '0 12px 30px rgba(16,185,129,0.3)' }}>
                  🚀 Explore Courses
                </Link>
                <Link to="/register" style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: 700, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                  Join Free
                </Link>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                {[{ val: '25M+', label: 'Learners' }, { val: '5,000+', label: 'Courses' }, { val: '4.8★', label: 'Avg. Rating' }].map((s, i) => (
                  <div key={s.label} className="animate-fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'both' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{s.val}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="animate-fade-in-right" style={{ animationDelay: '0.2s', animationFillMode: 'both', position: 'relative' }}>
              {/* Main image card */}
              <div style={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
                  alt="Learning"
                  style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, transparent 60%)' }} />
              </div>

              {/* Floating info cards */}
              <div className="animate-float" style={{ position: 'absolute', top: '-20px', right: '-30px', background: 'white', borderRadius: '18px', padding: '1rem 1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '190px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🎓</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111', fontSize: '0.95rem' }}>New Certificate</div>
                  <div style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>React Pro earned!</div>
                </div>
              </div>
              <div className="animate-float" style={{ position: 'absolute', bottom: '-20px', left: '-30px', background: 'white', borderRadius: '18px', padding: '1rem 1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '190px', animationDelay: '2s' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📈</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#111', fontSize: '0.95rem' }}>Daily Progress</div>
                  <div style={{ color: '#6366f1', fontSize: '0.78rem', fontWeight: 600 }}>3 lessons today 🔥</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─── */}
      <section className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', background: '#ecfdf5', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '0.75rem' }}>
              <span style={{ color: '#065f46', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Featured Content</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', letterSpacing: '-0.03em', margin: 0 }}>Top Recommended Courses</h2>
          </div>
          <Link to="/courses" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            View All Courses →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid-courses stagger">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton animate-fade-in" style={{ height: '340px', borderRadius: '24px' }} />
            ))}
          </div>
        ) : (
          <div className="grid-courses stagger">
            {courses.slice(0, 4).map((course, idx) => (
              <Link to={`/courses/${course.id}`} key={course.id} className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'flex', flexDirection: 'column', transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)', animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                <div style={{ height: '190px', overflow: 'hidden', position: 'relative', background: '#f3f4f6' }}>
                  <img src={course.thumbnail || course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500'} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500'; }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                  {course.category_name && <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(16,185,129,0.9)', color: 'white', borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.72rem', fontWeight: 700 }}>{course.category_name}</span>}
                </div>
                <div style={{ padding: '1.25rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.6rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.title}</h3>
                  <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
                    <span>⭐ <strong style={{ color: '#111' }}>{course.average_rating || '4.8'}</strong></span>
                    <span>👥 {course.enrolled_count || '0'} students</span>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{parseFloat(course.price || 0) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '0.35rem 0.85rem', borderRadius: '999px' }}>Enroll →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="categories-section container" style={{ paddingBottom: '120px' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="badge">Popular Categories</span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Explore Top Topics</h2>
        </div>
        <div className="categories-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {categories.map(cat => (
            <Link key={cat.name} to={`/courses?category=${cat.name}`} className="category-tile glass-hover" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#fff',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div className="category-img-wrapper" style={{ 
                height: '200px', 
                width: '100%', 
                backgroundColor: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '1.5rem',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain'
                  }} 
                />
              </div>
              <div className="category-content" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{cat.name}</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                  {cat.desc}
                </p>
                <div className="mt-auto pt-3" style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  Explore Topic →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;