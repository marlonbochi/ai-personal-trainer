export type Language = 'en' | 'pt';

export const defaultLanguage: Language = 'en';

export const supportedLanguages: Language[] = ['en', 'pt'];

// Helper function to get the user's preferred language
export const getUserLanguage = (): Language => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  // Get browser language
  const browserLanguage = navigator.language.split('-')[0];
  
  // Check if the browser language is supported
  return supportedLanguages.includes(browserLanguage as Language) 
    ? browserLanguage as Language 
    : defaultLanguage;
};
