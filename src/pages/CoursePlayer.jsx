import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await api.get(`/courses/${id}/learn/`);
        setCourse(response.data);
        // Set first lesson as default if available
        if (response.data.modules?.length > 0 && response.data.modules[0].lessons?.length > 0) {
          setCurrentLesson(response.data.modules[0].lessons[0]);
        }
      } catch (err) {
        console.error('Failed to fetch learning content:', err);
        if (err.response?.status === 403) {
          showToast('You must be enrolled to view this content.', 'error');
          navigate(`/courses/${id}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseContent();
  }, [id, navigate, showToast]);

  const handleLessonComplete = async (lessonId) => {
    try {
      // Per Swagger: /enrollments/lesson-progress/ POST takes lesson (UUID)
      await api.post('/enrollments/lesson-progress/', { 
        lesson: lessonId,
        completed: true 
      });
      
      // Update local state to show progress
      setCourse(prev => {
        const newModules = prev.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l)
        }));
        return { ...prev, modules: newModules };
      });

      showToast('Great job! Lesson marked as completed.', 'success');
    } catch (err) {
      console.error('Failed to update progress:', err);
      showToast('Could not save your progress. Please try again.', 'error');
    }
  };

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Preparing your classroom...</h2></div>;
  if (!course) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Content not available</h2></div>;

  return (
    <div className="course-player-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', height: '100vh', paddingTop: '80px' }}>
      {/* Video/Main Content Area */}
      <main className="player-main p-8 overflow-y-auto">
        <div className="video-container glass mb-8" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: 'black', overflow: 'hidden' }}>
          {currentLesson?.video_url ? (
            <video src={currentLesson.video_url} controls style={{ width: '100%', height: '100%' }} />
          ) : (
            <div className="text-center p-20">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎥</div>
              <h3>Video Content Placeholder</h3>
              <p className="text-text-muted">This lesson would typically feature a video or interactive content.</p>
            </div>
          )}
        </div>

        <div className="lesson-details">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="mb-2">{currentLesson?.title || 'Starting your journey'}</h2>
              <p className="text-text-muted">Part of Module: {course.modules.find(m => m.lessons.some(l => l.id === currentLesson?.id))?.title || 'Basic'}</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => handleLessonComplete(currentLesson?.id)}
              disabled={!currentLesson}
            >
              Complete & Continue
            </button>
          </div>
          <div className="glass p-8 rounded-3xl mt-10">
            <h3>Lesson Notes</h3>
            <p className="mt-4 text-text-muted" style={{ lineHeight: 1.8 }}>
              {currentLesson?.content || 'Enjoy this lesson! Take notes on the key concepts discussed in this video. Practice makes perfect.'}
            </p>
          </div>
        </div>
      </main>

      {/* Sidebar Curriculum */}
      <aside className="curriculum-sidebar glass overflow-y-auto border-l border-white/10 p-6">
        <h3 className="mb-8">Course Content</h3>
        {course.modules.map((module, mIdx) => (
          <div key={module.id} className="module-group mb-8">
            <h4 className="mb-4 text-sm text-text-muted font-bold text-gray-400">MODULE {mIdx + 1}: {module.title}</h4>
            <div className="lessons-list flex flex-col gap-2">
              {module.lessons.map((lesson, lIdx) => (
                <button
                  key={lesson.id}
                  className={`lesson-item glass p-4 rounded-xl text-left transition-all ${currentLesson?.id === lesson.id ? 'border-primary' : ''}`}
                  onClick={() => setCurrentLesson(lesson)}
                  style={{ border: currentLesson?.id === lesson.id ? '1px solid var(--primary)' : '1px solid transparent', background: currentLesson?.id === lesson.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="lesson-idx text-xs bg-white/10 w-6 h-6 rounded-full flex items-center justify-center">{lIdx + 1}</div>
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
};

export default CoursePlayer;
