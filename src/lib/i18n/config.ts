export type Language = 'en' | 'pt';

export const defaultLanguage: Language = 'en';

export const supportedLanguages: Language[] = ['en', 'pt'];

// Helper function to get the user's preferred language
export const getUserLanguage = (): Language => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  // 1. Check for saved language in localStorage
  const savedLanguage = localStorage.getItem('userLanguage');
  if (savedLanguage && supportedLanguages.includes(savedLanguage as Language)) {
    return savedLanguage as Language;
  }
  
  // 2. Get browser language if no saved preference
  const browserLanguage = navigator.language.split('-')[0];
  const detectedLanguage = supportedLanguages.includes(browserLanguage as Language)
    ? browserLanguage as Language
    : defaultLanguage;
  
  // Save the detected language for future use
  if (typeof window !== 'undefined') {
    localStorage.setItem('userLanguage', detectedLanguage);
  }
  
  return detectedLanguage;
};
