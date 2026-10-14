import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
import axios from 'axios';
import { resetRateLimits } from '../src/middleware/rateLimit';
import handler from '../src/pages/api/replace-exercise';

function mockRes() {
  const res: any = { statusCode: 0, body: undefined, headers: {} };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  return res;
}

const body = { language: 'en', exercise: { name: 'Leg Press', description: '3x12' }, otherExercises: ['Squat'], reason: 'no machine' };
const req = (over: any = {}) => ({ method: 'POST', headers: { origin: 'https://aitrainer.marlonbochi.com.br' }, body, ...over }) as any;

beforeEach(() => {
  resetRateLimits();
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
  vi.stubEnv('GEMINI_API_URL', 'https://example.test/gemini');
});

describe('POST /api/replace-exercise', () => {
  it('rejects requests from a foreign origin', async () => {
    const res = mockRes();
    await handler(req({ headers: { origin: 'https://evil.example' } }), res);
    expect(res.statusCode).toBe(403);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('rejects non-POST methods', async () => {
    const res = mockRes();
    await handler(req({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects invalid bodies without calling Gemini', async () => {
    const res = mockRes();
    await handler(req({ body: { language: 'en' } }), res);
    expect(res.statusCode).toBe(400);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('returns the parsed replacement exercise', async () => {
    (axios.post as any).mockResolvedValue({ data: { candidates: [{ content: { parts: [{ text: '{"name":"Goblet Squat","description":"3x12"}' }] } }] } });
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ name: 'Goblet Squat', description: '3x12' });
  });

  it('returns a generic error (no secret/details) when Gemini fails', async () => {
    (axios.post as any).mockRejectedValue(new Error('503 https://example.test/gemini?key=test-key'));
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to replace exercise' });
    expect(JSON.stringify(res.body)).not.toContain('test-key');
  });

  it('returns a generic error when Gemini replies with garbage', async () => {
    (axios.post as any).mockResolvedValue({ data: { candidates: [{ content: { parts: [{ text: 'nope' }] } }] } });
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(500);
  });

  it('answers 429 once a client exceeds the per-minute budget', async () => {
    (axios.post as any).mockResolvedValue({ data: { candidates: [{ content: { parts: [{ text: '{"name":"A","description":"B"}' }] } }] } });
    let last = 0;
    for (let i = 0; i < 21; i++) { const r = mockRes(); await handler(req(), r); last = r.statusCode; }
    expect(last).toBe(429);
  });
});
