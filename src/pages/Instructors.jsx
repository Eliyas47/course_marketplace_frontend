import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const fallbackInstructors = [
  {
    name: 'Alex Morgan',
    title: 'Senior Full-Stack Engineer',
    bio: 'Build production-ready web apps with practical architecture patterns.',
    initials: 'AM',
    courseCount: 5,
    studentCount: 4200,
    categories: ['Development', 'Design'],
  },
  {
    name: 'Priya Nair',
    title: 'Growth Marketing Lead',
    bio: 'Scale products with lifecycle funnels, content strategy, and analytics.',
    initials: 'PN',
    courseCount: 3,
    studentCount: 2800,
    categories: ['Marketing', 'Business'],
  },
  {
    name: 'Daniel Reed',
    title: 'Product & Startup Mentor',
    bio: 'Turn ideas into validated products with strong execution systems.',
    initials: 'DR',
    courseCount: 4,
    studentCount: 3500,
    categories: ['Business'],
  },
];

const toInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'IN';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const Instructors = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/');
        setCourses(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch courses for instructors page:', err);
        showToast('Unable to load instructors list. Please try again later.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const instructors = useMemo(() => {
    const grouped = courses.reduce((acc, course) => {
      const name = course.instructor_name?.trim() || 'Expert Instructor';
      const key = name.toLowerCase();

      if (!acc[key]) {
        acc[key] = {
          name,
          title: `${course.category || 'Multi-Discipline'} Instructor`,
          bio: 'Teaching practical, industry-ready skills through project-based learning.',
          initials: toInitials(name),
          courseCount: 0,
          studentCount: 0,
          categories: new Set(),
        };
      }

      acc[key].courseCount += 1;
      acc[key].studentCount += toNumber(course.enrolled_students);
      if (course.category) {
        acc[key].categories.add(course.category);
      }

      return acc;
    }, {});

    return Object.values(grouped)
      .map((instructor) => ({
        ...instructor,
        categories: Array.from(instructor.categories),
      }))
      .sort((a, b) => b.courseCount - a.courseCount);
  }, [courses]);

  const displayInstructors = instructors.length ? instructors : fallbackInstructors;

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <header className="mb-12" style={{ textAlign: 'center' }}>
        <span className="badge">Meet Your Mentors</span>
        <h1 style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>Top Instructors</h1>
        <p className="text-text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
          Learn from instructors with real-world expertise across development, design, business, and marketing.
        </p>
      </header>

      {isLoading ? (
        <div className="grid-courses">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass" style={{ height: '250px', borderRadius: '20px' }} />
          ))}
        </div>
      ) : (
        <section className="grid-courses">
          {displayInstructors.map((instructor) => (
            <article key={instructor.name} className="glass glass-hover p-6 rounded-3xl" style={{ minHeight: '250px' }}>
              <div className="flex items-center gap-4 mb-4">
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px var(--primary-glow)',
                  }}
                >
                  {instructor.initials}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{instructor.name}</h3>
                  <p className="text-text-muted" style={{ margin: '0.35rem 0 0' }}>{instructor.title}</p>
                </div>
              </div>

              <p className="text-text-muted" style={{ marginBottom: '1rem' }}>{instructor.bio}</p>

              <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                <span className="glass" style={{ padding: '0.4rem 0.7rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                  {instructor.courseCount} courses
                </span>
                <span className="glass" style={{ padding: '0.4rem 0.7rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                  {toNumber(instructor.studentCount).toLocaleString()} students
                </span>
              </div>

              <div className="mb-6" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {instructor.categories.slice(0, 3).map((category) => (
                  <span
                    key={`${instructor.name}-${category}`}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px',
                      border: '1px solid var(--border)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>

              <Link to={`/courses?search=${encodeURIComponent(instructor.name)}`} className="btn btn-outline w-full">
                View Courses by {instructor.initials}
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Instructors;
