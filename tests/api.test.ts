import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithValidation } from '@/lib/api';

const ORIGIN = 'https://aitrainer.marlonbochi.com.br';
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('window', { location: { origin: ORIGIN } });
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('fetchWithValidation', () => {
  it('resolves relative URLs against the page origin and sends same-origin credentials', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: 1 }));
    await fetchWithValidation('/api/workout', { method: 'POST', body: '{}' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${ORIGIN}/api/workout`);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{}');
    expect(init.credentials).toBe('same-origin');
  });

  it('keeps caller headers and adds X-Requested-With on same-origin requests', async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await fetchWithValidation('/api/workout', { headers: { 'Content-Type': 'application/json' } });
    const headers: Headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
  });

  it('does not add app headers to cross-origin requests', async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await fetchWithValidation('https://other.example/data');
    const headers: Headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.get('X-Requested-With')).toBeNull();
  });

  it('returns the parsed JSON body', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { monday: [{ name: 'Squat' }] }));
    expect(await fetchWithValidation('/api/workout')).toEqual({ monday: [{ name: 'Squat' }] });
  });

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await fetchWithValidation('/api/x')).toBeUndefined();
  });

  it('surfaces the server error message, which the API sends in the `error` field', async () => {
    fetchMock.mockResolvedValueOnce(json(429, { error: 'Too many requests' }));
    await expect(fetchWithValidation('/api/workout')).rejects.toThrow('Too many requests');
  });

  it('still understands a `message` field', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { message: 'Bad input' }));
    await expect(fetchWithValidation('/api/workout')).rejects.toThrow('Bad input');
  });

  it('falls back to the status text when the error body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 502, statusText: 'Bad Gateway' }));
    await expect(fetchWithValidation('/api/workout')).rejects.toThrow('Bad Gateway');
  });

  it('rejects a successful response whose body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }));
    await expect(fetchWithValidation('/api/workout')).rejects.toThrow('Failed to parse JSON response');
  });
});
