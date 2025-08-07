'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Language, getUserLanguage } from './config';
import translations, { TranslationKey } from './translations';

interface TranslationContextType {
  t: (key: TranslationKey) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getUserLanguage());

  // Update language in both state and localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLanguage', lang);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations[getUserLanguage()]?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
