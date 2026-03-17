import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const PasswordResetConfirm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    password2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = searchParams.get('token');
    if (!token) {
      showToast('Invalid or missing reset token.', 'error');
      return;
    }

    if (formData.password !== formData.password2) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Backend: /auth/password-reset-confirm/
      await api.post('/auth/password-reset-confirm/', {
        token,
        password: formData.password
      });
      showToast('Password reset successful! You can now log in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      console.error('Password reset failed:', err);
      showToast(err.response?.data?.detail || 'Failed to reset password. The link may have expired.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h1>New Password</h1>
          <p>Please enter and confirm your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form mt-8">
          <div className="form-group">
            <label>New Password</label>
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
            <label>Confirm New Password</label>
            <input
              type="password"
              name="password2"
              placeholder="Repeat new password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 mt-4" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
