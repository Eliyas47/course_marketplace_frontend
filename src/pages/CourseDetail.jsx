import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesApi, enrollmentsApi } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await enrollmentsApi.enroll(id);
      showToast('Successfully enrolled! You can now start learning.', 'success');
      navigate(`/learn/${id}`);
    } catch (err) {
      console.error('Enrollment failed:', err);
      if (err.response?.status === 400) {
        showToast('You are already enrolled in this course.', 'warning');
      } else {
        showToast('Failed to enroll. Please try again.', 'error');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await coursesApi.detail(id);
        setCourse(response.data);
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        showToast('Unable to load this course right now.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id, showToast]);

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading course details...</h2></div>;
  if (!course) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Course not found</h2></div>;

  return (
    <div className="course-detail-container animate-fade-in">
      {/* Course Hero Banner */}
      <section className="course-hero glass">
        <div className="container course-hero-container gap-10 py-12">
          <div className="course-hero-info flex-1">
            <span className="badge">{course.category_name || course.category}</span>
            <h1 className="mt-4 mb-6">{course.title}</h1>
            <p className="text-lg text-text-muted mb-8">{course.description}</p>
            
            <div className="course-stats flex gap-8 items-center" style={{ flexWrap: 'wrap' }}>
              <div className="flex items-center gap-2">⭐ <span style={{ fontWeight: 700 }}>{course.average_rating || 'N/A'}</span></div>
              <div className="flex items-center gap-2">👤 <span style={{ fontWeight: 700 }}>{course.enrolled_count || '0'}</span> <span className="text-text-muted">students</span></div>
              <div className="flex items-center gap-2">📅 <span className="text-text-muted">Last updated {new Date(course.updated_at || Date.now()).toLocaleDateString()}</span></div>
            </div>

            <div className="instructor-minimal mt-8 flex items-center gap-4">
              <div className="avatar-circle" style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{course.instructor_name?.[0] || 'I'}</div>
              <div>
                <div style={{ fontWeight: 600 }}>By {course.instructor_name || 'Expert Instructor'}</div>
                <div className="text-sm text-text-muted">{course.instructor_title || 'Lead Instructor'}</div>
              </div>
            </div>
          </div>

          <div className="course-checkout-card glass p-6 rounded-3xl" style={{ position: 'relative', zIndex: 10 }}>
            <div className="course-preview-img mb-6">
              <img src={course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500&auto=format&fit=crop'} alt={course.title} style={{ width: '100%', borderRadius: '20px' }} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="price" style={{ fontSize: '2.5rem' }}>${course.price}</div>
              <div className="text-text-muted" style={{ textDecoration: 'line-through' }}>-</div>
            </div>
            <button 
              className="btn btn-primary w-full py-4 text-lg mb-4" 
              onClick={() => navigate(`/checkout/${id}`)}
            >
              Enroll Now
            </button>
            <p className="text-center text-sm text-text-muted">Instant Access to All Course Materials</p>
            
            <div className="course-features mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <h4 className="mb-4">This course includes:</h4>
              <ul className="flex flex-col gap-3" style={{ listStyle: 'none', padding: 0 }}>
                <li>📺 12.5 hours on-demand video</li>
                <li>📄 42 downloadable resources</li>
                <li>♾️ Full lifetime access</li>
                <li>🏆 Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mt-12 mb-20">
        <div className="detail-tabs flex gap-8 mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          {['description', 'curriculum', 'reviews'].map(tab => (
            <button 
              key={tab} 
              className={`tab-btn font-medium capitalize ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', color: activeTab === tab ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', position: 'relative' }}
            >
              {tab}
              {activeTab === tab && <div className="tab-indicator" />}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="animate-fade-in glass p-8 rounded-3xl">
              <h3 className="mb-6">What you'll learn</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {['Build professional websites', 'Master React and modern JS', 'Understand state management', 'Deploy full-stack apps'].map(item => (
                  <div key={item} className="flex gap-3">✅ <span>{item}</span></div>
                ))}
              </div>
              <h3 className="mb-4">Requirements</h3>
              <ul className="text-text-muted mb-8">
                <li>Basic understanding of HTML and CSS</li>
                <li>A computer with internet access</li>
                <li>Drive to learn and practice daily</li>
              </ul>
              <h3 className="mb-4">Full Description</h3>
              <p className="text-text-muted" style={{ lineHeight: 1.8 }}>{course.description}</p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="animate-fade-in flex flex-col gap-4">
              {course.modules?.length > 0 ? (
                course.modules.map((module, idx) => (
                  <div key={module.id} className="glass p-6 rounded-2xl">
                    <div className="flex justify-between items-center cursor-pointer">
                      <h4 style={{ margin: 0 }}>Module {idx + 1}: {module.title}</h4>
                      <span className="text-text-muted">{module.lessons?.length || 0} Lessons</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass p-10 text-center rounded-3xl">
                  <p className="text-text-muted">Curriculum details are coming soon.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in flex flex-col gap-6">
              {[1, 2, 3].map(rev => (
                <div key={rev} className="glass p-6 rounded-2xl flex gap-6">
                  <div className="avatar-circle">U{rev}</div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div style={{ fontWeight: 600 }}>Student User {rev}</div>
                      <div className="text-primary">⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className="text-text-muted">Great course! The explanations are clear and the projects are very helpful.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;