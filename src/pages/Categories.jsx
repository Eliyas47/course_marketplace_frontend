import { Link, useNavigate } from 'react-router-dom';
import devImg from '../assets/Development.jpg';
import bizImg from '../assets/Business.jpg';
import designImg from '../assets/graphics design.jpg';
import marketingImg from '../assets/Marketing.jpg';
import photoImg from '../assets/photography.jpg';
import musicImg from '../assets/Music.jpg';

const CATEGORY_DATA = [
  {
    name: 'Development',
    img: devImg,
    icon: '💻',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    glow: 'rgba(99, 102, 241, 0.2)',
    desc: 'Build modern websites and robust applications with cutting-edge technologies like React, Python, Node.js and more.',
    courses: '1,200+',
    students: '45k+',
    tags: ['React', 'Python', 'Node.js', 'TypeScript'],
  },
  {
    name: 'Business',
    img: bizImg,
    icon: '📊',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16, 185, 129, 0.2)',
    desc: 'Master leadership, finance, entrepreneurship, and strategy to scale your career and build successful ventures.',
    courses: '800+',
    students: '32k+',
    tags: ['Strategy', 'Finance', 'Leadership', 'Startup'],
  },
  {
    name: 'Design',
    img: designImg,
    icon: '🎨',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    glow: 'rgba(236, 72, 153, 0.2)',
    desc: "Create stunning visuals, user-centric interfaces, and brand identities that make businesses stand out.",
    courses: '650+',
    students: '28k+',
    tags: ['Figma', 'UI/UX', 'Branding', 'Illustration'],
  },
  {
    name: 'Marketing',
    img: marketingImg,
    icon: '📈',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245, 158, 11, 0.2)',
    desc: 'Learn digital marketing strategies, SEO, social media, and analytics to reach global audiences and drive growth.',
    courses: '500+',
    students: '21k+',
    tags: ['SEO', 'Social Media', 'Analytics', 'Ads'],
  },
  {
    name: 'Photography',
    img: photoImg,
    icon: '📸',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    glow: 'rgba(6, 182, 212, 0.2)',
    desc: 'Capture breathtaking moments with professional lighting, composition, and post-processing techniques.',
    courses: '350+',
    students: '15k+',
    tags: ['Portrait', 'Landscape', 'Lightroom', 'Editing'],
  },
  {
    name: 'Music',
    img: musicImg,
    icon: '🎸',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    glow: 'rgba(139, 92, 246, 0.2)',
    desc: 'Produce, mix, and play your way to the top. Learn from professional musicians and audio engineers.',
    courses: '280+',
    students: '12k+',
    tags: ['Guitar', 'Production', 'Mixing', 'Theory'],
  },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '150px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '0.5rem 1.25rem', marginBottom: '1.5rem' }}>
            <span>✨</span>
            <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Browse By Topic</span>
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'white', lineHeight: 1.1 }}>
            Explore Our<br />
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #ec4899, #f59e0b)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Learning Categories
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.7 }}>
            From code to creativity, from strategy to self-expression — find your passion and make it a profession.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[{ val: '6', label: 'Categories' }, { val: '3,780+', label: 'Courses' }, { val: '153k+', label: 'Students' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container" style={{ padding: '80px 0 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
          {CATEGORY_DATA.map((cat, idx) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/courses?category=${cat.name}`)}
              style={{
                background: 'white',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '1px solid #e5e7eb',
                animation: `fadeIn 0.6s ease ${idx * 0.1}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = `0 30px 60px ${cat.glow}`;
                e.currentTarget.style.borderColor = cat.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Image with gradient overlay */}
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={cat.img}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)` }} />
                {/* Icon badge */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', width: '52px', height: '52px', borderRadius: '16px', background: cat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: `0 8px 20px ${cat.glow}` }}>
                  {cat.icon}
                </div>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                  <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{cat.name}</h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>📚 {cat.courses} courses</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>👥 {cat.students} students</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.2rem' }}>{cat.desc}</p>
                
                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {cat.tags.map(tag => (
                    <span key={tag} style={{ background: `${cat.color}14`, color: cat.color, borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${cat.color}25` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ background: cat.gradient, borderRadius: '14px', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <span>Explore {cat.name}</span>
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '5rem', padding: '4rem 2rem', background: 'linear-gradient(135deg, #f0fdf4, #f0f9ff)', borderRadius: '32px', border: '1px solid rgba(16,185,129,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Can't find what you're looking for?</h3>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '450px', margin: '0 auto 2rem', lineHeight: 1.6 }}>Browse all courses with powerful search and filtering to find exactly what you need.</p>
          <Link to="/courses" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px' }}>Browse All Courses</Link>
        </div>
      </section>
    </div>
  );
};

export default Categories;
