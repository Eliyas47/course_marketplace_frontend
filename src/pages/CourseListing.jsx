import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const CourseListing = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
  });

  const [categories, setCategories] = useState([]);

  // Effect for initial data load (courses and categories)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, catsRes] = await Promise.all([
          api.get('/courses/', { params: filters }),
          api.get('/courses/categories/')
        ]);
        setCourses(coursesRes.data.results || coursesRes.data || []);
        setCategories(catsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch course listing data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Effect for filtering courses based on filter changes
  useEffect(() => {
    const fetchFilteredCourses = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.level) params.level = filters.level;

        const response = await api.get('/courses/', { params });
        setCourses(response.data.results || response.data || []);
      } catch (err) {
        console.error('Failed to fetch filtered courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Skip on initial mount as first effect handles it
    const isInitialMount = courses.length === 0 && isLoading;
    if (!isInitialMount) {
      fetchFilteredCourses();
    }
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    const newSearchParams = new URLSearchParams(searchParams); // Create a mutable copy
    if (value) {
      newSearchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="mb-2">Explore Courses</h1>
          <p className="text-text-muted">Discover the perfect course to advance your career</p>
        </div>
        <div className="search-bar glass" style={{ display: 'flex', alignItems: 'center', padding: '0.4rem 1rem', borderRadius: '14px', width: '400px' }}>
          <span style={{ marginRight: '0.75rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search for anything..." 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', padding: '0.5rem 0' }}
          />
        </div>
      </div>

      <div className="course-listing-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }}>
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filter-group mb-8">
            <h4 className="mb-4">Category</h4>
            <div className="filter-options flex flex-col gap-3">
              {['All', 'Development', 'Business', 'Design', 'Marketing'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer text-text-muted hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={(cat === 'All' && !filters.category) || filters.category === cat}
                    onChange={() => handleFilterChange('category', cat === 'All' ? '' : cat)}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group mb-8">
            <h4 className="mb-4">Level</h4>
            <div className="filter-options flex flex-col gap-3">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <label key={lvl} className="flex items-center gap-3 cursor-pointer text-text-muted hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="level" 
                    checked={(lvl === 'All' && !filters.level) || filters.level === lvl}
                    onChange={() => handleFilterChange('level', lvl === 'All' ? '' : lvl)}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-outline w-full" 
            onClick={() => {
              setFilters({ search: '', category: '', level: '' });
              setSearchParams({});
            }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Course Grid */}
        <main>
          {isLoading ? (
            <div className="grid-courses">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="course-card-skeleton glass" style={{ height: '350px', borderRadius: '20px' }} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid-courses">
              {courses.map(course => (
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
          ) : (
            <div className="glass text-center py-20 rounded-3xl">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No courses found</h3>
              <p className="text-text-muted">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseListing;
