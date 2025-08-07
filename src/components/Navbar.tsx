'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';
import { Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { href: '/workout', label: t('nav.home'), icon: '🏋️' },
    // { href: '/generate-workout', label: t('nav.generateWorkout'), icon: '➕' },
  ];

  const isActive = (path: string) => {
    return pathname === path || (path === '/workout' && pathname === '/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowLanguageDropdown(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowLanguageDropdown(false);
    // Store the language preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLanguage', newLanguage);
    }
    // Refresh the page to apply language changes to static content
    router.refresh();
  };

  return (
    <>
      <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/workout" 
                className="text-xl font-bold flex items-center h-full px-3 hover:bg-indigo-700 transition-colors"
                onClick={closeMenu}
              >
                {t('app.name')}
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center h-full transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`md:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="pt-5 pb-3 px-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="text-lg font-medium text-gray-900">Menu</div>
              <button
                onClick={closeMenu}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-5 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Language Selector */}
            <div className="mt-auto border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                aria-label="Change language"
              >
                <div className="flex items-center">
                  <span className="flex items-center">
                    {language === 'en' ? (
                      <>
                        <span className="mr-2">🇬🇧</span>
                        <span>{t('language.english')}</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🇧🇷</span>
                        <span>{t('language.portuguese')}</span>
                      </>
                    )}
                  </span>
                </div>
                <span className={`transform transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}>
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
              
              {showLanguageDropdown && (
                <div className="mt-2 space-y-1 pl-8">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                      language === 'en'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">🇬🇧</span>
                    {t('language.english')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('pt')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                      language === 'pt'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">🇧🇷</span>
                    {t('language.portuguese')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
