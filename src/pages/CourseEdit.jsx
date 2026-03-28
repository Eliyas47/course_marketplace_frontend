import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const normalizeCategories = (data) => {
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.categories)
        ? data.categories
        : [];

  return rawItems
    .map((item) => {
      if (typeof item === 'string') {
        return { id: item, name: item };
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const id = item.id || item.uuid || item.slug || item.name;
      const name = item.name || item.title || String(id || '');

      if (!id || !name) {
        return null;
      }

      return { id: String(id), name: String(name) };
    })
    .filter(Boolean);
};

const CourseEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    is_published: false,
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, categoriesRes] = await Promise.all([
          api.get(`/courses/${id}/`),
          api.get('/courses/categories/')
        ]);
        
        const course = courseRes.data;
        setFormData({
          title: course.title,
          description: course.description,
          category: String(course.category?.id || course.category?.uuid || course.category || ''),
          price: course.price,
          is_published: course.is_published,
        });
        setCategories(normalizeCategories(categoriesRes.data));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Could not load course data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Per Swagger: /courses/{id}/update/ accepts PATCH
      await api.patch(`/courses/${id}/update/`, formData);
      alert('Course updated successfully!');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Update failed:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to update course.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Loading course editor...</h2></div>;

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="glass p-8 rounded-3xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="btn btn-outline text-sm mb-4">← Back</button>
          <h1>Edit Course Content</h1>
          <p className="text-text-muted">Modify your course details and settings below.</p>
        </div>

        {error && <div className="auth-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Core Content</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-text-muted text-sm">Course Title</label>
                <input
                  type="text"
                  name="title"
                  className="glass w-full p-4 rounded-xl mt-1"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-text-muted text-sm">Detailed Description</label>
                <textarea
                  name="description"
                  className="glass w-full p-4 rounded-xl mt-1"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Marketplace Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-text-muted text-sm">Category</label>
                <select
                  name="category"
                  className="glass w-full p-4 rounded-xl mt-1"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-text-muted text-sm">Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  className="glass w-full p-4 rounded-xl mt-1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                checked={formData.is_published}
                onChange={handleChange}
              />
              <label htmlFor="is_published" style={{ fontWeight: 600, cursor: 'pointer' }}>
                Make this course public on the marketplace
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn btn-primary flex-1 py-4 text-lg" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
            <button type="button" onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline px-8" disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEdit;
