'use client';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Github, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { t } = useTranslation();
  
  // Get all translations at once to minimize hook calls
  const translations = {
    title: t('about.title'),
    aboutApp: t('about.aboutApp'),
    appDescription: t('about.appDescription'),
    aboutMe: t('about.aboutMe'),
    myDescription: t('about.myDescription'),
    importantNote: t('about.importantNote'),
    disclaimer: t('about.disclaimer'),
    howItWorks: t('about.howItWorks'),
    step1Title: t('about.step1Title'),
    step1Desc: t('about.step1Desc'),
    step2Title: t('about.step2Title'),
    step2Desc: t('about.step2Desc'),
    step3Title: t('about.step3Title'),
    step3Desc: t('about.step3Desc')
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {translations.title}
        </h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {translations.aboutApp}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {translations.appDescription}
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {translations.aboutMe}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {translations.myDescription}
            </p>
          </section>
          
          <section className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">
              {translations.importantNote}
            </h2>
            <p className="text-yellow-700 leading-relaxed">
              {translations.disclaimer}
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {translations.howItWorks}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">1</div>
                <div>
                  <h3 className="font-medium text-gray-900">{translations.step1Title}</h3>
                  <p className="text-gray-600">{translations.step1Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">2</div>
                <div>
                  <h3 className="font-medium text-gray-900">{translations.step2Title}</h3>
                  <p className="text-gray-600">{translations.step2Desc}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">3</div>
                <div>
                  <h3 className="font-medium text-gray-900">{translations.step3Title}</h3>
                  <p className="text-gray-600">{translations.step3Desc}</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Social Media Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-center text-gray-900 mb-4">
              {t('about.connectWithMe')}
            </h3>
            <div className="flex justify-center space-x-6">
              <Link 
                href="https://instagram.com/marlonbochi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-8 w-8" />
              </Link>
              <Link 
                href="https://github.com/marlonbochi/ai-personal-trainer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-8 w-8" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
