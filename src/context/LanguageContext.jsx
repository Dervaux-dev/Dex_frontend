import { useState, useEffect } from 'react';
import { LANGUAGES, TRANSLATIONS } from './languageData';
import { LanguageContext } from './languageContextInstance';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('dex_language');
    if (saved && ['kiny', 'en', 'fr'].includes(saved)) {
      return saved;
    }
    return 'kiny';
  });

  const setLanguage = (langCode) => {
    if (['kiny', 'en', 'fr'].includes(langCode)) {
      setLanguageState(langCode);
      localStorage.setItem('dex_language', langCode);
    }
  };

  const rotateLanguage = () => {
    setLanguageState((prev) => {
      let nextLang;
      if (prev === 'kiny') nextLang = 'en';
      else if (prev === 'en') nextLang = 'fr';
      else nextLang = 'kiny';

      localStorage.setItem('dex_language', nextLang);
      return nextLang;
    });
  };

  useEffect(() => {
    const htmlLang = language === 'kiny' ? 'rw' : language;
    document.documentElement.lang = htmlLang;
  }, [language]);

  const currentLangMeta = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key, fallback = '') => {
    const entry = TRANSLATIONS[key];
    if (!entry) return fallback || key;
    return entry[language] || entry.en || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        rotateLanguage,
        currentLangMeta,
        languages: LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
