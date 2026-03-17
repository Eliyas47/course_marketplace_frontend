import { useState, useEffect } from 'react';
import api from '../api/axios';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = sessionStorage.getItem('auth_success_message');
    if (!message) {
      return;
    }

    setSuccessMessage(message);
    sessionStorage.removeItem('auth_success_message');

    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch profile for dashboard dispersion:', err);
        setError('Failed to load profile. Please try logging in again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <div style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Determining your role...</h2></div>;
  
  if (error) return (
    <div style={{ paddingTop: '150px', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--error)' }}>{error}</h2>
      <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/login'}>Go to Login</button>
    </div>
  );

  // Dispatch based on role
  // According to Swagger: role: "student/instructor/admin"
  const role = user?.role?.toLowerCase();

  let dashboardContent = <StudentDashboard />;

  if (role === 'admin') {
    dashboardContent = <AdminDashboard />;
  } else if (role === 'instructor') {
    dashboardContent = <InstructorDashboard />;
  }

  return (
    <>
      {successMessage && <div className="auth-success-banner jump-text">{successMessage}</div>}
      {dashboardContent}
    </>
  );
};

export default Dashboard;
