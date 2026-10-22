import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withOriginValidation } from '@/middleware/validateOrigin';

const PROD = 'https://aitrainer.marlonbochi.com.br';

function run(headers: Record<string, string>) {
  const handler = vi.fn((_req: any, res: any) => res.status(200).json({ ok: true }));
  const res: any = { statusCode: 0 };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = () => res;
  return Promise.resolve(withOriginValidation(handler)({ headers } as any, res)).then(() => ({
    status: res.statusCode,
    reachedHandler: handler.mock.calls.length === 1,
  }));
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
});

describe('withOriginValidation (production)', () => {
  it.each([
    ['the production origin', { origin: PROD }],
    ['the production origin with Sec-Fetch-Site same-origin', { origin: PROD, 'sec-fetch-site': 'same-origin' }],
    ['the production origin with Sec-Fetch-Site none', { origin: PROD, 'sec-fetch-site': 'none' }],
    ['no Origin but a same-origin Referer', { referer: `${PROD}/workout?x=1` }],
  ])('lets through %s', async (_label, headers) => {
    expect(await run(headers)).toEqual({ status: 200, reachedHandler: true });
  });

  it.each([
    ['a foreign Origin', { origin: 'https://evil.example' }],
    ['a lookalike Origin', { origin: `${PROD}.evil.example` }],
    ['no Origin and no Referer', {}],
    ['a lookalike Referer (prefix trick)', { referer: `${PROD}.evil.example/workout` }],
    ['a malformed Referer', { referer: 'not a url' }],
    ['a cross-site request even with a forged valid Origin', { origin: PROD, 'sec-fetch-site': 'cross-site' }],
    ['a same-site (other subdomain) request', { origin: PROD, 'sec-fetch-site': 'same-site' }],
    ['an http (downgraded) Origin', { origin: 'http://aitrainer.marlonbochi.com.br' }],
  ])('rejects %s with 403 before the handler runs', async (_label, headers) => {
    expect(await run(headers)).toEqual({ status: 403, reachedHandler: false });
  });

  it('accepts the deployment origin configured in NEXT_PUBLIC_APP_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://preview.example.dev');
    expect(await run({ origin: 'https://preview.example.dev' })).toEqual({ status: 200, reachedHandler: true });
  });

  it('does not accept NEXT_PUBLIC_APP_URL when it is not configured', async () => {
    expect(await run({ origin: 'https://preview.example.dev' })).toEqual({ status: 403, reachedHandler: false });
  });
});

describe('withOriginValidation (development)', () => {
  it('skips the check only when NODE_ENV is development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(await run({ origin: 'https://evil.example' })).toEqual({ status: 200, reachedHandler: true });
  });
});
