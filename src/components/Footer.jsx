import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      {/* Decorative top wave/gradient line */}
      <div className="footer-gradient-bar" />

      <div className="footer-container">
        {/* Main 4-column layout */}
        <div className="footer-grid">
          {/* Column 1: Brand & Organization */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="footer-brand-icon">🎨</span>
              <div>
                <h3 className="footer-brand-title">Digital Arts</h3>
                <span className="footer-brand-subtitle">DexElearning Platform</span>
              </div>
            </div>
            <p className="footer-desc">
              Empowering primary school students across Rwanda with engaging digital lessons, 
              curriculum-aligned PDFs, AI study summaries, and interactive quizzes.
            </p>

            {/* CEO Highlight Card */}
            <div className="ceo-badge-card">
              <span className="ceo-badge-icon">👑</span>
              <div className="ceo-info">
                <span className="ceo-label">Founder &amp; CEO</span>
                <span className="ceo-name">NZANYWAYIMANA Ineza Yves Delvo</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">🏠 Home</Link></li>
              <li><Link to="/courses">📚 All Courses</Link></li>
              <li><Link to="/dashboard">⭐ Student Dashboard</Link></li>
              <li><Link to="/login">🔐 Student Login</Link></li>
              <li><Link to="/register">✨ Create Account</Link></li>
            </ul>
          </div>

          {/* Column 3: Primary Grades */}
          <div className="footer-col">
            <h4 className="footer-col-title">Primary Grades</h4>
            <ul className="footer-links grade-links">
              <li><Link to="/courses?grade=Primary%201">🎒 Primary 1 (P1)</Link></li>
              <li><Link to="/courses?grade=Primary%202">🎨 Primary 2 (P2)</Link></li>
              <li><Link to="/courses?grade=Primary%203">🚀 Primary 3 (P3)</Link></li>
              <li><Link to="/courses?grade=Primary%204">🧬 Primary 4 (P4)</Link></li>
              <li><Link to="/courses?grade=Primary%205">🌍 Primary 5 (P5)</Link></li>
              <li><Link to="/courses?grade=Primary%206">🏆 Primary 6 (P6)</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="footer-col contact-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <span>Rwanda</span>
                </div>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <a href="tel:0783589357" className="contact-link">0783589357</a>
                  <span className="contact-sub">(+250 783 589 357)</span>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:inezadervaux@gmail.com" className="contact-link">
                    inezadervaux@gmail.com
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon">💬</span>
                <div>
                  <strong>WhatsApp</strong>
                  <a
                    href="https://wa.me/250783589357"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link whatsapp-link"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Suggestions Section */}
        <div className="footer-extra-bar">
          <div className="footer-extra-left">
            <span className="extra-tag">✨ Newsletter</span>
            <p>Subscribe for free weekly study materials, exam tips, and new quiz releases.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter student or parent email..." 
              aria-label="Email address for newsletter"
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="footer-bottom">
          <div className="footer-bottom-copy">
            <p>
              &copy; {currentYear} <strong>Digital Arts</strong>. All rights reserved.
            </p>
            <p className="ceo-copyright-note">
              Leadership: <strong>NZANYWAYIMANA Ineza Yves Delvo</strong> (CEO) &bull; Rwanda 🇷🇼
            </p>
          </div>

          <div className="footer-bottom-legal">
            <span className="legal-tag">🔒 Child Safe Platform</span>
            <span className="legal-separator">&bull;</span>
            <span>Privacy Policy</span>
            <span className="legal-separator">&bull;</span>
            <span>Terms of Service</span>
            <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Back to top">
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
