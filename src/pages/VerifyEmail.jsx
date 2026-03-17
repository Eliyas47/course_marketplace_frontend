import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token.');
      return;
    }

    const verify = async () => {
      try {
        // Swagger: /auth/verify-email/ POST takes token
        await api.post('/auth/verify-email/', { token });
        setStatus('success');
      } catch (err) {
        console.error('Verification failed:', err);
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          {status === 'verifying' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        
        {status === 'verifying' && (
          <>
            <h1>Verifying Email</h1>
            <p className="text-text-muted mt-2">Please wait while we confirm your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-primary">Email Verified!</h1>
            <p className="text-text-muted mt-2">Thank you for verifying your email. Your account is now fully active.</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary w-full mt-8">
              Proceed to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-error">Verification Failed</h1>
            <p className="text-text-muted mt-2">{message}</p>
            <button onClick={() => navigate('/register')} className="btn btn-outline w-full mt-8">
              Back to Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
