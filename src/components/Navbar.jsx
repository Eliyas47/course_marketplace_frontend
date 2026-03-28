import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import learnhubLogo from '../assets/learnhub-logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (username) => {
    if (!username) return 'U';
    return username
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'U';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const hydrateUser = async () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);

      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const response = await api.get('/auth/profile/');
        setProfile({
          username: response.data?.username || 'User',
          role: response.data?.role || 'student',
        });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setProfile(null);
      }
    };

    hydrateUser();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getDashboardLink = () => {
    if (!profile) return '/login';
    const role = profile.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    return '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src={learnhubLogo}
              alt="LearnHub Course Marketplace"
              className="brand-logo-image"
            />
          </Link>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
          <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
          <Link to="/instructors" onClick={() => setIsMobileMenuOpen(false)}>Instructors</Link>
          
          {/* Show Auth links in mobile menu if not logged in */}
          {!isLoggedIn && isMobileMenuOpen && (
            <div className="mobile-auth-links">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className="profile-trigger"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <div className="profile-avatar">{getInitials(profile?.username)}</div>
                <div className="profile-info-compact">
                  <span className="profile-name">{profile?.username}</span>
                  <span className="profile-role-tag">{profile?.role}</span>
                </div>
                <span className={`profile-caret ${isMenuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {isMenuOpen && (
                <div className="profile-dropdown glass animate-fade-in shadow-2xl">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar-large">{getInitials(profile?.username)}</div>
                    <div className="profile-dropdown-meta">
                      <div className="profile-dropdown-name">{profile?.username || 'User'}</div>
                      <div className="profile-dropdown-role">{profile?.role?.toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <div className="profile-dropdown-divider"></div>
                  
                  <Link to={getDashboardLink()} className="profile-item" onClick={() => setIsMenuOpen(false)}>
                    <span className="item-icon">📊</span>
                    <span>My Dashboard</span>
                  </Link>

                  <Link to="/profile" className="profile-item" onClick={() => setIsMenuOpen(false)}>
                    <span className="item-icon">👤</span>
                    <span>Edit Profile</span>
                  </Link>
                  
                  <Link to="/certificates" className="profile-item" onClick={() => setIsMenuOpen(false)}>
                    <span className="item-icon">🏆</span>
                    <span>My Certificates</span>
                  </Link>

                  {profile?.role === 'instructor' && (
                    <Link to="/courses/create" className="profile-item" onClick={() => setIsMenuOpen(false)}>
                      <span className="item-icon">➕</span>
                      <span>Create Course</span>
                    </Link>
                  )}

                  <Link to="/settings" className="profile-item" onClick={() => setIsMenuOpen(false)}>
                    <span className="item-icon">⚙️</span>
                    <span>Account Settings</span>
                  </Link>

                  <div className="profile-dropdown-divider"></div>

                  <button onClick={handleLogout} className="profile-item profile-item-danger">
                    <span className="item-icon">🏃</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="desktop-auth-actions">
              <Link to="/login" style={{color: 'var(--text-muted)', fontWeight: '500'}}>Log In</Link>
              <Link to="/register" className="btn btn-primary text-sm py-2 px-6">Join Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
