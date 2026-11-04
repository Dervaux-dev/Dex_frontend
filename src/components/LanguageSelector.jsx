import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, setLanguage, rotateLanguage, currentLangMeta, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRotate = (e) => {
    e.stopPropagation();
    setRotating(true);
    rotateLanguage();
    setTimeout(() => setRotating(false), 400);
  };

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-wrapper" ref={dropdownRef}>
      {/* Quick rotation button */}
      <button
        type="button"
        className="lang-rotate-btn"
        onClick={handleRotate}
        title={`${t('common.rotateLang')}: Kinyarwanda ➔ English ➔ Français`}
        aria-label="Rotate language"
      >
        <span className={`rotate-icon ${rotating ? 'spin-anim' : ''}`}>🔄</span>
        <span className="lang-flag">{currentLangMeta.flag}</span>
        <span className="lang-short">{currentLangMeta.short}</span>
      </button>

      {/* Dropdown toggle arrow */}
      <button
        type="button"
        className={`lang-chevron-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle language menu"
        aria-expanded={isOpen}
      >
        ▾
      </button>

      {/* Language menu */}
      {isOpen && (
        <div className="lang-dropdown-menu">
          <div className="lang-menu-header">
            <span>{t('common.rotateLang')}</span>
          </div>
          {languages.map((l) => {
            const isActive = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                className={`lang-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(l.code)}
              >
                <span className="item-flag">{l.flag}</span>
                <span className="item-label">{l.label}</span>
                {isActive && <span className="active-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
