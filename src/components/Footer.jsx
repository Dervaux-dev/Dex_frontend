import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

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
              {t('footer.desc', 'Empowering primary school students across Rwanda with engaging digital lessons, curriculum-aligned PDFs, AI study summaries, and interactive quizzes.')}
            </p>

            {/* CEO Highlight Card */}
            <div className="ceo-badge-card">
              <span className="ceo-badge-icon">👑</span>
              <div className="ceo-info">
                <span className="ceo-label">Founder &amp; CEO</span>
                <span className="ceo-name"> Dervaux</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t('footer.quickLinks', 'Quick Links')}</h4>
            <ul className="footer-links">
              <li><Link to="/">🏠 {t('nav.home', 'Home')}</Link></li>
              <li><Link to="/courses">📚 {t('nav.grades', 'All Courses')}</Link></li>
              <li><Link to="/dashboard">⭐ {t('nav.dashboard', 'Student Dashboard')}</Link></li>
              <li><Link to="/login">🔐 {t('nav.login', 'Student Login')}</Link></li>
              <li><Link to="/register">✨ {t('nav.signup', 'Create Account')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Primary Grades */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t('footer.primaryGrades', 'Primary Grades')}</h4>
            <ul className="footer-links grade-links">
              <li><Link to="/courses?grade=Primary%201">🎒 {t('grade.p1', 'Primary 1')} (P1)</Link></li>
              <li><Link to="/courses?grade=Primary%202">🎨 {t('grade.p2', 'Primary 2')} (P2)</Link></li>
              <li><Link to="/courses?grade=Primary%203">🚀 {t('grade.p3', 'Primary 3')} (P3)</Link></li>
              <li><Link to="/courses?grade=Primary%204">🧬 {t('grade.p4', 'Primary 4')} (P4)</Link></li>
              <li><Link to="/courses?grade=Primary%205">🌍 {t('grade.p5', 'Primary 5')} (P5)</Link></li>
              <li><Link to="/courses?grade=Primary%206">🏆 {t('grade.p6', 'Primary 6')} (P6)</Link></li>
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
                  <p>Kigali, Rwanda</p>
                </div>
              </li>
              <li>
                <span className="contact-icon">📧</span>
                <div>
                  <strong>Email Support</strong>
                  <a href="mailto:support@dexelearning.rw">support@dexelearning.rw</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone / WhatsApp</strong>
                  <a href="tel:+250783589357">+250 783589357</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">🌐</span>
                <div>
                  <strong>Social / Community</strong>
                  <a href="https://www.youtube.com/@DigitalArts_001" target="_blank" rel="noopener noreferrer">
                    @DigitalArts_001
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
              &copy; {currentYear} <strong>Digital Arts</strong>. {t('footer.rights', 'All rights reserved.')}
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
