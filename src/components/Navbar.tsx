'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Language } from '@/lib/i18n/config';
import { Menu, X, Globe, Dumbbell, UtensilsCrossed, BarChart3, UserCircle, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const navItems = [
    { href: '/workout', label: t('nav.home'), icon: Dumbbell },
    { href: '/nutrition', label: t('nutrition.title'), icon: UtensilsCrossed },
    { href: '/about', label: t('about.title'), icon: UserCircle },
  ];

  const isActive = (path: string) => {
    return pathname === path || (path === '/workout' && pathname === '/');
  };

  const isSubPage = pathname?.startsWith('/generate-');

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowLanguageDropdown(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLanguage', newLanguage);
    }
    router.refresh();
  };

  const getPageTitle = () => {
    if (pathname === '/workout') return t('workout.title');
    if (pathname === '/nutrition') return t('nutrition.mealPlan');
    if (pathname === '/about') return t('about.title');
    if (pathname === '/generate-workout') return t('workout.customizePlan');
    if (pathname === '/generate-nutrition') return t('nutrition.customizePlan');
    return t('app.name');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-warm-bg sticky top-0 z-50 border-b border-warm-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {isSubPage && (
              <button onClick={() => router.back()} className="text-bark-700">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-bark-800">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full text-bark-500 hover:bg-warm-border/50 transition-colors"
              aria-label="Menu"
            >
              {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300">
            <div className="pt-5 pb-3 px-4">
              <div className="flex items-center justify-between border-b border-warm-border pb-4">
                <div className="text-lg font-medium text-bark-800">Menu</div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-bark-400 hover:text-bark-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="mt-4 border-b border-warm-border pb-4">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-bark-700 hover:bg-warm-bg rounded-xl"
                >
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-bark-400" />
                    <span>
                      {language === 'en' ? t('language.english') : t('language.portuguese')}
                    </span>
                  </div>
                  <svg
                    className={`h-5 w-5 text-bark-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {showLanguageDropdown && (
                  <div className="mt-2 space-y-1 pl-4">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center ${
                        language === 'en'
                          ? 'bg-terra-50 text-terra-700'
                          : 'text-bark-600 hover:bg-warm-bg'
                      }`}
                    >
                      <span className="mr-2">🇬🇧</span>
                      {t('language.english')}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('pt')}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl flex items-center ${
                        language === 'pt'
                          ? 'bg-terra-50 text-terra-700'
                          : 'text-bark-600 hover:bg-warm-bg'
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
        </>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-warm-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 transition-colors ${
                  active ? 'text-terra-600' : 'text-bark-400'
                }`}
              >
                <Icon className={`h-6 w-6 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
