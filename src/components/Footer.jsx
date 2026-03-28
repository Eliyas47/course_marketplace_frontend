import { Link } from 'react-router-dom';
import learnhubLogo from '../assets/learnhub-logo.png';

const Footer = () => {
  return (
    <footer className="footer shadow-lg">
      <div className="container footer-content">
        <div className="footer-section">
          <Link to="/" className="nav-logo" style={{ marginBottom: '1.5rem' }}>
            <img
              src={learnhubLogo}
              alt="LearnHub Course Marketplace"
              className="brand-logo-image footer-brand-logo"
            />
          </Link>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
            Empowering learners worldwide through high-quality, accessible online education from top industry experts.
          </p>
        </div>

        <div className="footer-section">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/courses">All Courses</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/instructors">Instructors</Link></li>
            <li><Link to="/certifications">Certifications</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Newsletter</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Get the latest course updates and offers.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="glass" 
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', color: 'white', outline: 'none', width: '100%' }}
            />
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Subscribe</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid var(--border)', marginTop: '4rem', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} LearnHub Marketplace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
