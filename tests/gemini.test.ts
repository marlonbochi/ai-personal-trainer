import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
import axios from 'axios';
import { deriveFallbackUrl, generateWithFallback, isFallbackWorthy, GeminiError } from '@/lib/gemini';

const PRIMARY = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const FALLBACK = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const body = { contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } } };
const ok = (text: string) => ({ data: { candidates: [{ content: { parts: [{ text }] } }] } });
const httpError = (status: number) => Object.assign(new Error(`status ${status} https://x?key=SECRET`), { response: { status }, config: { url: `${PRIMARY}?key=SECRET`, headers: { 'x-goog-api-key': 'SECRET' } } });
const post = axios.post as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('GEMINI_API_KEY', 'SECRET');
  vi.stubEnv('GEMINI_API_URL', PRIMARY);
  vi.stubEnv('GEMINI_FALLBACK_MODEL', '');
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('deriveFallbackUrl', () => {
  it('swaps only the model segment', () => {
    expect(deriveFallbackUrl(PRIMARY, 'gemini-3.8-flash')).toBe(FALLBACK);
  });
  it('returns null when the URL has no models/<name>: segment', () => {
    expect(deriveFallbackUrl('https://example.test/gemini', 'x')).toBeNull();
  });
});

describe('isFallbackWorthy', () => {
  it.each([404, 408, 429, 500, 503])('falls back on HTTP %i', status => {
    expect(isFallbackWorthy(httpError(status))).toBe(true);
  });
  it.each([400, 401, 403])('does not fall back on HTTP %i (our request or credentials)', status => {
    expect(isFallbackWorthy(httpError(status))).toBe(false);
  });
  it('falls back on network errors and unusable output', () => {
    expect(isFallbackWorthy(new Error('ECONNRESET'))).toBe(true);
    expect(isFallbackWorthy(new GeminiError('Failed to parse'))).toBe(true);
  });
});

describe('generateWithFallback', () => {
  it('uses only the primary model when it succeeds', async () => {
    post.mockResolvedValueOnce(ok('{"a":1}'));
    const out = await generateWithFallback(body, t => JSON.parse(t));
    expect(out).toEqual({ result: { a: 1 }, usedFallback: false });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toBe(PRIMARY);
  });

  it('sends the key as a header, never in the URL', async () => {
    post.mockResolvedValueOnce(ok('{}'));
    await generateWithFallback(body, t => JSON.parse(t));
    expect(post.mock.calls[0][0]).not.toContain('key=');
    expect(post.mock.calls[0][2].headers['x-goog-api-key']).toBe('SECRET');
  });

  it.each([503, 429, 404])('falls back to gemini-3.8-flash when the primary returns %i', async status => {
    post.mockRejectedValueOnce(httpError(status)).mockResolvedValueOnce(ok('{"b":2}'));
    const out = await generateWithFallback(body, t => JSON.parse(t));
    expect(out).toEqual({ result: { b: 2 }, usedFallback: true });
    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[1][0]).toBe(FALLBACK);
  });

  it('falls back on a network error', async () => {
    post.mockRejectedValueOnce(new Error('socket hang up')).mockResolvedValueOnce(ok('{"c":3}'));
    expect((await generateWithFallback(body, t => JSON.parse(t))).usedFallback).toBe(true);
  });

  it('falls back when the primary reply cannot be parsed', async () => {
    post.mockResolvedValueOnce(ok('not json')).mockResolvedValueOnce(ok('{"d":4}'));
    const out = await generateWithFallback(body, t => JSON.parse(t));
    expect(out).toEqual({ result: { d: 4 }, usedFallback: true });
  });

  it('does not fall back on a 400 (our own bad request)', async () => {
    post.mockRejectedValueOnce(httpError(400));
    await expect(generateWithFallback(body, t => JSON.parse(t))).rejects.toThrow('status 400');
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('drops thinkingConfig for the fallback model but keeps the rest', async () => {
    post.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(ok('{}'));
    await generateWithFallback(body, t => JSON.parse(t));
    expect(post.mock.calls[0][1].generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect(post.mock.calls[1][1].generationConfig).toEqual({ responseMimeType: 'application/json' });
  });

  it('honours GEMINI_FALLBACK_MODEL', async () => {
    vi.stubEnv('GEMINI_FALLBACK_MODEL', 'gemini-3.5-flash-lite');
    post.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(ok('{}'));
    await generateWithFallback(body, t => JSON.parse(t));
    expect(post.mock.calls[1][0]).toContain('/models/gemini-3.5-flash-lite:');
  });

  it('throws a sanitised error when both models fail (no key, URL or axios config)', async () => {
    post.mockRejectedValueOnce(httpError(503)).mockRejectedValueOnce(httpError(429));
    const error = await generateWithFallback(body, t => JSON.parse(t)).catch(e => e);
    expect(error).toBeInstanceOf(GeminiError);
    expect(error.status).toBe(429);
    expect(JSON.stringify(error)).not.toContain('SECRET');
    expect(String(error.message)).not.toContain('SECRET');
    expect('config' in error).toBe(false);
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('does not log the key or URL when falling back', async () => {
    post.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(ok('{}'));
    await generateWithFallback(body, t => JSON.parse(t));
    const logged = JSON.stringify((console.warn as any).mock.calls);
    expect(logged).not.toContain('SECRET');
    expect(logged).not.toContain('https://');
  });

  it('does not attempt a fallback when the URL has no model segment', async () => {
    vi.stubEnv('GEMINI_API_URL', 'https://example.test/gemini');
    post.mockRejectedValueOnce(httpError(503));
    await expect(generateWithFallback(body, t => JSON.parse(t))).rejects.toBeTruthy();
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('fails fast without credentials', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    await expect(generateWithFallback(body, t => t)).rejects.toThrow('not configured');
    expect(post).not.toHaveBeenCalled();
  });
});
