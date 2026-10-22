import { describe, it, expect, vi, afterEach } from 'vitest';
import translations from '@/lib/i18n/translations';
import { getUserLanguage } from '@/lib/i18n/config';

describe('translations (Constitution VI: bilingual by design)', () => {
  const en = Object.keys(translations.en).sort();
  const pt = Object.keys(translations.pt).sort();

  it('every English key has a Portuguese translation', () => {
    expect(en.filter(k => !pt.includes(k))).toEqual([]);
  });

  it('every Portuguese key has an English translation', () => {
    expect(pt.filter(k => !en.includes(k))).toEqual([]);
  });

  it('no translation is empty', () => {
    const empty = (['en', 'pt'] as const).flatMap(lang =>
      Object.entries(translations[lang]).filter(([, v]) => !String(v).trim()).map(([k]) => `${lang}:${k}`)
    );
    expect(empty).toEqual([]);
  });

  it('nested groups are flattened into dotted keys', () => {
    expect(translations.pt['workout.daysOfWeek.monday' as never]).toBe('Segunda-feira');
    expect(translations.en['nutrition.goals.weight_loss' as never]).toBe('Weight Loss');
  });
});

describe('getUserLanguage', () => {
  afterEach(() => vi.unstubAllGlobals());

  function browser(saved: string | null, browserLanguage: string) {
    const store = new Map<string, string>(saved === null ? [] : [['userLanguage', saved]]);
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
    });
    vi.stubGlobal('navigator', { language: browserLanguage });
    return store;
  }

  it('uses a saved supported language over the browser language', () => {
    browser('pt', 'en-US');
    expect(getUserLanguage()).toBe('pt');
  });

  it('ignores a saved unsupported language and falls back to the browser language', () => {
    browser('fr', 'pt-BR');
    expect(getUserLanguage()).toBe('pt');
  });

  it('maps a regional browser language (pt-BR) to pt and remembers it', () => {
    const store = browser(null, 'pt-BR');
    expect(getUserLanguage()).toBe('pt');
    expect(store.get('userLanguage')).toBe('pt');
  });

  it('defaults to English for unsupported browser languages', () => {
    const store = browser(null, 'fr-FR');
    expect(getUserLanguage()).toBe('en');
    expect(store.get('userLanguage')).toBe('en');
  });

  it('defaults to English during server rendering (no window)', () => {
    vi.stubGlobal('window', undefined);
    expect(getUserLanguage()).toBe('en');
  });
});
