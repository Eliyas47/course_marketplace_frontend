import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      username: formData.username.trim(),
      email: formData.email.trim(),
    };

    if (payload.password !== payload.password2) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register/', payload);
      showToast('Account created! Please check your email for a verification link to activate your account.', 'success');
      navigate('/login');
    } catch (err) {
      console.error('Registration error detail:', err.response?.data);
      const data = err.response?.data;
      
      let errorMessage = 'Registration failed. Please try again.';
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else {
          const firstError = Object.values(data).flat()[0];
          if (firstError) errorMessage = firstError;
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up and start your learning journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. eliyas_learns"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>I want to be a</label>
            <div className="role-selector">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <div className="role-box">
                  <span className="icon" style={{ fontSize: '1.5rem' }}>👨‍🎓</span>
                  <span>Student</span>
                </div>
              </label>
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={formData.role === 'instructor'}
                  onChange={handleChange}
                />
                <div className="role-box">
                  <span className="icon" style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
                  <span>Instructor</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="password2"
              placeholder="Repeat your password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 mt-4" disabled={isLoading} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;