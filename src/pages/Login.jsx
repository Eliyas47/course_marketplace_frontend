import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const message = location.state?.message;
    if (!message) {
      return;
    }

    setSuccessMessage(message);
    const timer = setTimeout(() => setSuccessMessage(''), 3800);

    return () => clearTimeout(timer);
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLoginErrorMessage = (err) => {
    const data = err.response?.data;

    if (!data) {
      return 'Invalid username or password. Please try again.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
      return data.non_field_errors[0];
    }

    const firstError = Object.values(data).flat()[0];
    return firstError || 'Invalid username or password. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedPayload = {
      ...formData,
      username: formData.username.trim(),
    };

    try {
      let response;

      // Prefer password-based JWT endpoint and fall back to legacy login if needed.
      try {
        response = await api.post('/token/', trimmedPayload);
      } catch (tokenError) {
        if (tokenError?.response?.status !== 404) {
          throw tokenError;
        }
        response = await api.post('/auth/login/', trimmedPayload);
      }

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Store success message for the dashboard jumps
      sessionStorage.setItem('auth_success_message', '🚀 Successfully authenticated! Welcome back.');
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      
      const errorMessage = getLoginErrorMessage(err);

      showToast(
        isNetworkError
          ? 'Unable to reach the server. Please check your connection and try again.'
          : errorMessage,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Log in to LearnHub</h1>
          <p>Advance your career with expert-led courses.</p>
        </div>

          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success float-up-fade">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. name@example.com"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label style={{ marginBottom: 0 }}>Password</label>
              <Link to="/password-reset" className="text-xs text-primary font-medium" style={{ textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-between items-center mt-2 mb-2">
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <input type="checkbox" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} /> Remember me
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 mt-2" disabled={isLoading} style={{ fontSize: '1rem', fontWeight: 700 }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Join Free</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;