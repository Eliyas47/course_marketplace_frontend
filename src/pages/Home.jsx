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
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '100px 0' }}>
        <div className="container hero-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '4rem' }}>
          <div className="hero-text animate-fade-in" style={{ textAlign: 'left' }}>
            <span className="badge">New Era of Learning</span>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>Master Your Future with <span>Expert-Led</span> Courses</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Join 25 million+ learners and start your journey today. Access over 5,000+ courses 
              ranging from Web Development to Personal Development.
            </p>
            <div className="hero-actions flex gap-4">
              <Link to="/courses" className="btn btn-primary px-10 py-4" style={{ fontSize: '1.1rem' }}>Explore Courses</Link>
              <Link to="/register" className="btn btn-outline px-10 py-4" style={{ fontSize: '1.1rem' }}>Become an Instructor</Link>
            </div>
          </div>
          
          <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="visual-card glass" style={{ padding: '10px', borderRadius: '32px' }}>
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" alt="Environment" style={{ width: '100%', height: 'auto', borderRadius: '24px', display: 'block', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-section container">
        <div className="section-header flex justify-between items-end mb-10">
          <div>
            <span className="badge">Featured Content</span>
            <h2 className="mt-2">Top Recommended Courses</h2>
          </div>
          <Link to="/courses" className="text-primary font-medium" style={{ textDecoration: 'none' }}>View All Courses →</Link>
        </div>

        {isLoading ? (
          <div className="grid-courses">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="course-card-skeleton glass" style={{ height: '350px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : (
          <div className="grid-courses">
            {courses.slice(0, 4).map(course => (
              <Link to={`/courses/${course.id}`} key={course.id} className="course-card glass glass-hover">
                <div className="course-image">
                  <img src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop'} alt={course.title} />
                  <span className="course-category">{course.category}</span>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <div className="course-meta flex items-center gap-4">
                    <span className="flex items-center gap-1">⭐ {course.rating || '4.8'}</span>
                    <span className="text-text-muted">{course.enrolled_students || '1.2k'} Students</span>
                  </div>
                  <div className="course-price-container flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="price">${course.price}</span>
                    <span className="level">{course.level}</span>
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