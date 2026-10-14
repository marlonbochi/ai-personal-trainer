import type { NextApiRequest, NextApiResponse } from 'next';

// Best-effort, per-instance fixed-window limiter. On serverless hosting each
// warm instance keeps its own counters, so this blunts bursts and casual abuse;
// a hard guarantee needs a shared store or platform rate limiting (SECURITY.md).

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown;

interface Options {
  name: string;
  limit: number;
  windowMs: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 5000;

export function resetRateLimits(): void {
  buckets.clear();
}

// Hosting platforms (Vercel) overwrite these headers with the real client IP.
function clientIp(req: NextApiRequest): string {
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real) return real;
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

function purgeExpired(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

export function withRateLimit(handler: ApiHandler, { name, limit, windowMs }: Options): ApiHandler {
  return (req, res) => {
    const now = Date.now();
    purgeExpired(now);

    const key = `${name}:${clientIp(req)}`;
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return handler(req, res);
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    return handler(req, res);
  };
}
