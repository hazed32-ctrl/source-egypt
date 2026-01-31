import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL for language
    const path = window.location.pathname;
    if (path.startsWith('/ar')) return 'ar';
    if (path.startsWith('/en')) return 'en';
    // Check localStorage
    const stored = localStorage.getItem('language') as Language;
    if (stored) return stored;
    // Default
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    changeLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update URL if needed
    const path = window.location.pathname;
    const cleanPath = path.replace(/^\/(en|ar)/, '');
    const newPath = `/${lang}${cleanPath || '/'}`;
    window.history.replaceState({}, '', newPath);
  };

  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
