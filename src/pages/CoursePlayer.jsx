import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coursesApi, enrollmentsApi, responseUtils } from '../api/lmsApi';
import { useToast } from '../context/ToastContext';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const [courseRes, progressRes] = await Promise.allSettled([
          coursesApi.learn(id),
          enrollmentsApi.readCourseProgress(id),
        ]);

        if (courseRes.status === 'fulfilled') {
          const courseData = courseRes.value.data;
          setCourse(courseData);
          if (courseData.modules?.length > 0 && courseData.modules[0].lessons?.length > 0) {
            setCurrentLesson(courseData.modules[0].lessons[0]);
          }
        } else {
          if (courseRes.reason?.response?.status === 403) {
            showToast('You must be enrolled to view this content.', 'error');
            navigate(`/courses/${id}`);
          }
        }

        // Extract completed lesson IDs from progress
        if (progressRes.status === 'fulfilled') {
          const progressData = progressRes.value.data;
          const completed = new Set();
          const items = Array.isArray(progressData)
            ? progressData
            : Array.isArray(progressData?.results)
              ? progressData.results
              : Array.isArray(progressData?.lesson_progress)
                ? progressData.lesson_progress
                : [];
          items.filter(p => p.completed).forEach(p => {
            if (p.lesson) completed.add(p.lesson);
          });
          setCompletedLessonIds(completed);
        }
      } catch (err) {
        console.error('Failed to fetch learning content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseContent();
  }, [id, navigate, showToast]);

  const handleLessonComplete = async (lessonId) => {
    if (!lessonId || isMarkingComplete) return;
    if (completedLessonIds.has(lessonId)) {
      showToast('This lesson is already marked as complete!', 'info');
      return;
    }
    setIsMarkingComplete(true);
    try {
      await enrollmentsApi.markLessonProgress({ lesson: lessonId, completed: true });
      setCompletedLessonIds(prev => new Set([...prev, lessonId]));
      showToast('🎉 Lesson marked as completed!', 'success');

      // Auto-advance to next lesson
      if (course?.modules) {
        let found = false;
        for (const module of course.modules) {
          for (let i = 0; i < module.lessons.length; i++) {
            if (module.lessons[i].id === lessonId && i + 1 < module.lessons.length) {
              setCurrentLesson(module.lessons[i + 1]);
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
      showToast('Could not save your progress. Please try again.', 'error');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
        <h2>Preparing your classroom...</h2>
      </div>
    );
  }
  if (!course) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Content not available</h2></div>;

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedCount = completedLessonIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentComplete = currentLesson && completedLessonIds.has(currentLesson.id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: '100vh', paddingTop: '80px', background: '#f8fafc' }}>
      {/* Main Content */}
      <main style={{ overflowY: 'auto', padding: '2.5rem' }}>
        {/* Video Area */}
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '28px', background: 'black', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', marginBottom: '2rem', position: 'relative' }}>
          {currentLesson?.video_url ? (
            <video src={currentLesson.video_url} controls style={{ width: '100%', height: '100%' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', gap: '1rem' }}>
              <div style={{ fontSize: '5rem' }}>🎥</div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>No video for this lesson</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Read the lesson notes below</p>
            </div>
          )}
        </div>

        {/* Lesson Controls */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {course.modules.find(m => m.lessons.some(l => l.id === currentLesson?.id))?.title || 'Module'}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>{currentLesson?.title || 'Select a lesson'}</h2>
            </div>
            <button
              className={`btn ${isCurrentComplete ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => handleLessonComplete(currentLesson?.id)}
              disabled={!currentLesson || isMarkingComplete}
              style={{ minWidth: '180px', padding: '1rem 1.5rem', borderRadius: '16px', fontSize: '1rem', flexShrink: 0, background: isCurrentComplete ? '#f0fdf4' : undefined, borderColor: isCurrentComplete ? 'var(--primary)' : undefined, color: isCurrentComplete ? 'var(--primary)' : undefined }}
            >
              {isMarkingComplete ? '⏳ Saving...' : isCurrentComplete ? '✅ Completed!' : '✅ Mark Complete'}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Course Progress</span>
              <span style={{ color: 'var(--primary)' }}>{completedCount}/{totalLessons} lessons · {progressPct}%</span>
            </div>
            <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '5px', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>

        {/* Lesson Notes */}
        {currentLesson?.content && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <h3 style={{ marginBottom: '1rem' }}>📝 Lesson Notes</h3>
            <p style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: '1.05rem' }}>{currentLesson.content}</p>
          </div>
        )}
      </main>

      {/* Sidebar Curriculum */}
      <aside style={{ overflowY: 'auto', borderLeft: '1px solid var(--border)', background: 'white', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Course Content</h3>
          <Link to={`/courses/${id}`} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back</Link>
        </div>

        {course.modules.map((module, mIdx) => (
          <div key={module.id} style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              Module {mIdx + 1}: {module.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {module.lessons.map((lesson, lIdx) => {
                const isActive = currentLesson?.id === lesson.id;
                const isDone = completedLessonIds.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '14px', border: 'none', cursor: 'pointer', textAlign: 'left', background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent', transition: 'all 0.2s', outline: isActive ? '2px solid var(--primary)' : 'none' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isDone ? 'var(--primary)' : isActive ? 'rgba(16,185,129,0.15)' : '#f3f4f6', color: isDone ? 'white' : isActive ? 'var(--primary)' : 'var(--text-muted)', fontSize: isDone ? '1rem' : '0.8rem', fontWeight: 700 }}>
                      {isDone ? '✓' : lIdx + 1}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main)' : isDone ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: 1.3, textDecoration: isDone ? 'line-through' : 'none' }}>{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {course.modules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p>No lessons added yet.</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CoursePlayer;
