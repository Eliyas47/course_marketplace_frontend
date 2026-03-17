import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CourseCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // UUID or ID
    price: '0.00',
    thumbnail: null,
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/courses/categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Swagger suggests categories are required
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        is_published: false // Start as draft
      };

      const response = await api.post('/courses/', payload);
      alert('Course created successfully! Now you can add lessons.');
      navigate(`/instructor/dashboard`);
    } catch (err) {
      console.error('Course creation failed:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to create course. Please check all fields.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
      <div className="glass p-8 rounded-3xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="mb-8 text-center">
          <span className="badge">Knowledge Creator</span>
          <h1 className="mt-2">Create a New Course</h1>
          <p className="text-text-muted">Fill in the details below to start your new teaching journey.</p>
        </div>

        {error && <div className="auth-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Basic Information</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-text-muted text-sm px-1">Course Title</label>
                <input
                  type="text"
                  name="title"
                  className="glass w-full p-4 rounded-xl mt-1"
                  placeholder="e.g. Advanced React Architecture"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-text-muted text-sm px-1">Description</label>
                <textarea
                  name="description"
                  className="glass w-full p-4 rounded-xl mt-1"
                  rows={5}
                  placeholder="What will students learn in this course?"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="mb-4">Settings & Category</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-text-muted text-sm px-1">Category</label>
                <select
                  name="category"
                  className="glass w-full p-4 rounded-xl mt-1"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-text-muted text-sm px-1">Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="glass w-full p-4 rounded-xl mt-1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center mt-4">
            <button type="submit" className="btn btn-primary w-full py-4 text-lg" disabled={isLoading}>
              {isLoading ? 'Creating Course...' : 'Create Course Draft'}
            </button>
            <p className="text-sm text-text-muted">Courses are created as drafts by default. You can publish them from your dashboard.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseCreate;
