'use client';
import { useTranslation } from '@/lib/i18n/TranslationContext';
import { Github, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { t } = useTranslation();
  
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
    <div className="min-h-screen bg-warm-bg py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* About App */}
        <div className="bg-white rounded-2xl border border-warm-border p-5">
          <h2 className="text-xl font-bold text-bark-800 mb-3">
            {translations.aboutApp}
          </h2>
          <p className="text-bark-500 leading-relaxed text-sm">
            {translations.appDescription}
          </p>
        </div>
        
        {/* About Me */}
        <div className="bg-white rounded-2xl border border-warm-border p-5">
          <h2 className="text-xl font-bold text-bark-800 mb-3">
            {translations.aboutMe}
          </h2>
          <p className="text-bark-500 leading-relaxed text-sm">
            {translations.myDescription}
          </p>
        </div>
        
        {/* Important Note */}
        <div className="bg-terra-50 rounded-2xl border-l-4 border-terra-500 p-5">
          <h2 className="text-lg font-bold text-terra-800 mb-2">
            {translations.importantNote}
          </h2>
          <p className="text-terra-700 leading-relaxed text-sm">
            {translations.disclaimer}
          </p>
        </div>
        
        {/* How It Works */}
        <div className="bg-white rounded-2xl border border-warm-border p-5">
          <h2 className="text-xl font-bold text-bark-800 mb-4">
            {translations.howItWorks}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-bark-800 text-sm">{translations.step1Title}</h3>
                <p className="text-bark-500 text-sm">{translations.step1Desc}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-bark-800 text-sm">{translations.step2Title}</h3>
                <p className="text-bark-500 text-sm">{translations.step2Desc}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-bark-800 text-sm">{translations.step3Title}</h3>
                <p className="text-bark-500 text-sm">{translations.step3Desc}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Media */}
        <div className="bg-white rounded-2xl border border-warm-border p-5">
          <h3 className="text-lg font-semibold text-center text-bark-800 mb-4">
            {t('about.connectWithMe')}
          </h3>
          <div className="flex justify-center gap-6">
            <Link 
              href="https://instagram.com/marlonbochi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-bark-400 hover:text-terra-500 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-7 w-7" />
            </Link>
            <Link 
              href="https://github.com/marlonbochi/ai-personal-trainer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-bark-400 hover:text-bark-800 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
