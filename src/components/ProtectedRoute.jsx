import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setUser(response.data);
      } catch (err) {
        console.error('ProtectedRoute: Failed to fetch user profile', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center' }}>
        <div className="loader"></div>
        <h2>Verifying access...</h2>
      </div>
    );
  }

  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect to home if they don't have the required role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
