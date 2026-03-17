import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseListing from './pages/CourseListing';
import CourseDetail from './pages/CourseDetail';
import Instructors from './pages/Instructors';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import CourseCreate from './pages/CourseCreate';
import CourseEdit from './pages/CourseEdit';
import AdminDashboard from './pages/AdminDashboard';
import CoursePlayer from './pages/CoursePlayer';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Routes>
          {/* Public Landing Page as the first page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          <Route path="/courses" element={<CourseListing />} />
          <Route path="/categories" element={<Navigate to="/courses" replace />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/password-reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
          
          {/* Protected General Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Student Specific Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="student">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/learn/:id" element={
            <ProtectedRoute requiredRole="student">
              <CoursePlayer />
            </ProtectedRoute>
          } />
          
          {/* Instructor Specific Routes */}
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute requiredRole="instructor">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/courses/create" element={
            <ProtectedRoute requiredRole="instructor">
              <CourseCreate />
            </ProtectedRoute>
          } />
          <Route path="/courses/:id/edit" element={
            <ProtectedRoute requiredRole="instructor">
              <CourseEdit />
            </ProtectedRoute>
          } />

          {/* Admin Specific Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/certificates" element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;