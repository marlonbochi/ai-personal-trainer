import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRateLimit, resetRateLimits } from '@/middleware/rateLimit';

function mockRes() {
  const res: any = { statusCode: 0, body: undefined, headers: {} };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: unknown) => { res.body = b; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  return res;
}
const req = (ip: string, extra: any = {}) => ({ headers: { 'x-real-ip': ip }, socket: {}, ...extra }) as any;

beforeEach(() => { resetRateLimits(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-01T00:00:00Z')); });
afterEach(() => vi.useRealTimers());

describe('withRateLimit', () => {
  const make = () => {
    const inner = vi.fn((_req: any, res: any) => res.status(200).json({ ok: true }));
    return { inner, handler: withRateLimit(inner, { name: 't', limit: 3, windowMs: 60_000 }) };
  };

  it('lets requests through up to the limit, then answers 429 with Retry-After', async () => {
    const { inner, handler } = make();
    for (let i = 0; i < 3; i++) { const r = mockRes(); await handler(req('1.1.1.1'), r); expect(r.statusCode).toBe(200); }
    const blocked = mockRes();
    await handler(req('1.1.1.1'), blocked);
    expect(blocked.statusCode).toBe(429);
    expect(blocked.body).toEqual({ error: 'Too many requests' });
    expect(Number(blocked.headers['Retry-After'])).toBeGreaterThan(0);
    expect(inner).toHaveBeenCalledTimes(3);
  });

  it('counts each client separately', async () => {
    const { handler } = make();
    for (let i = 0; i < 3; i++) await handler(req('1.1.1.1'), mockRes());
    const other = mockRes();
    await handler(req('2.2.2.2'), other);
    expect(other.statusCode).toBe(200);
  });

  it('opens a new window after the old one expires', async () => {
    const { handler } = make();
    for (let i = 0; i < 4; i++) await handler(req('1.1.1.1'), mockRes());
    vi.advanceTimersByTime(60_001);
    const r = mockRes();
    await handler(req('1.1.1.1'), r);
    expect(r.statusCode).toBe(200);
  });

  it('falls back to the first x-forwarded-for hop, then the socket address', async () => {
    const { handler } = make();
    const viaXff = (ip: string) => ({ headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` }, socket: {} }) as any;
    for (let i = 0; i < 3; i++) await handler(viaXff('3.3.3.3'), mockRes());
    const blocked = mockRes();
    await handler(viaXff('3.3.3.3'), blocked);
    expect(blocked.statusCode).toBe(429);

    for (let i = 0; i < 3; i++) await handler({ headers: {}, socket: { remoteAddress: '4.4.4.4' } } as any, mockRes());
    const blocked2 = mockRes();
    await handler({ headers: {}, socket: { remoteAddress: '4.4.4.4' } } as any, blocked2);
    expect(blocked2.statusCode).toBe(429);
  });

  it('keeps separate budgets per route name', async () => {
    const a = withRateLimit((_r: any, res: any) => res.status(200).json({}), { name: 'a', limit: 1, windowMs: 60_000 });
    const b = withRateLimit((_r: any, res: any) => res.status(200).json({}), { name: 'b', limit: 1, windowMs: 60_000 });
    await a(req('5.5.5.5'), mockRes());
    const r = mockRes();
    await b(req('5.5.5.5'), r);
    expect(r.statusCode).toBe(200);
  });
});
