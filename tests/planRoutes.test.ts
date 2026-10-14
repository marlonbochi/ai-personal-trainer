import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
import axios from 'axios';
import { resetRateLimits } from '../src/middleware/rateLimit';
import workoutHandler, { config as workoutConfig } from '../src/pages/api/workout';
import nutritionHandler, { config as nutritionConfig } from '../src/pages/api/nutrition';

function mockRes() {
  const res: any = { statusCode: 0, body: undefined, headers: {} };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  return res;
}
const origin = 'https://aitrainer.marlonbochi.com.br';
const post = (body: any, headers: any = { origin }) => ({ method: 'POST', headers, socket: {}, body }) as any;
const reply = (text: string) => ({ data: { candidates: [{ content: { parts: [{ text }] } }] } });

beforeEach(() => {
  resetRateLimits();
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubEnv('GEMINI_API_URL', 'https://example.test/v1beta/models/gemini-2.5-flash:generateContent');
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe.each([
  ['workout', workoutHandler, workoutConfig, { language: 'en', selectedDays: ['monday'], age: 30 }, '{"monday":[{"name":"Squat","description":"x"}]}'],
  ['nutrition', nutritionHandler, nutritionConfig, { language: 'en', dietGoal: 'maintenance', age: 30 }, '{"mealPlan":{"Monday":{}}}'],
] as const)('/api/%s', (_name, handler, config, validBody, geminiText) => {
  it('limits the request body size', () => {
    expect((config as any).api.bodyParser.sizeLimit).toBe('16kb');
  });

  it('rejects foreign origins before doing any paid work', async () => {
    const res = mockRes();
    await handler(post(validBody, { origin: 'https://evil.example' }), res);
    expect(res.statusCode).toBe(403);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('rejects invalid bodies with 400 and never calls Gemini', async () => {
    const res = mockRes();
    await handler(post({ ...validBody, age: 'DROP TABLE', notes: 'x' }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid request' });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('rejects oversized free text', async () => {
    const res = mockRes();
    await handler(post({ ...validBody, additionalNotes: 'x'.repeat(5000) }), res);
    expect(res.statusCode).toBe(400);
  });

  it('serves a valid request through the shared Gemini helper (key in header)', async () => {
    (axios.post as any).mockResolvedValueOnce(reply(geminiText));
    const res = mockRes();
    await handler(post(validBody), res);
    expect(res.statusCode).toBe(200);
    const [url, , options] = (axios.post as any).mock.calls[0];
    expect(url).not.toContain('key=');
    expect(options.headers['x-goog-api-key']).toBe('test-key');
  });

  it('asks Gemini for pure JSON output', async () => {
    (axios.post as any).mockResolvedValueOnce(reply(geminiText));
    await handler(post(validBody), mockRes());
    const sentBody = (axios.post as any).mock.calls[0][1];
    expect(sentBody.generationConfig).toEqual({ responseMimeType: 'application/json' });
  });

  it('falls back to the second model and still answers 200', async () => {
    (axios.post as any)
      .mockRejectedValueOnce(Object.assign(new Error('503'), { response: { status: 503 } }))
      .mockResolvedValueOnce(reply(geminiText));
    const res = mockRes();
    await handler(post(validBody), res);
    expect(res.statusCode).toBe(200);
    expect((axios.post as any).mock.calls[1][0]).toContain('/models/gemini-3.8-flash:');
  });

  it('returns a generic 500 with no internals when both models fail', async () => {
    (axios.post as any).mockRejectedValue(Object.assign(new Error('boom test-key'), { response: { status: 503 }, config: { headers: { 'x-goog-api-key': 'test-key' } } }));
    const res = mockRes();
    await handler(post(validBody), res);
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('test-key');
    const logged = JSON.stringify((console.error as any).mock.calls);
    expect(logged).not.toContain('test-key');
  });

  it('answers 429 after the per-minute budget is spent', async () => {
    (axios.post as any).mockResolvedValue(reply(geminiText));
    let last = 0;
    for (let i = 0; i < 11; i++) { const res = mockRes(); await handler(post(validBody), res); last = res.statusCode; }
    expect(last).toBe(429);
  });
});
