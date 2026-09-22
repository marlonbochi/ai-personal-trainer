import { NextApiRequest, NextApiResponse } from 'next';

// The production domain is always allowed; NEXT_PUBLIC_APP_URL covers
// whatever origin the app is actually deployed/previewed at.
const PRODUCTION_ORIGIN = 'https://aitrainer.marlonbochi.com.br';

function getAllowedOrigins(): string[] {
  const origins = new Set([PRODUCTION_ORIGIN]);
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.add(process.env.NEXT_PUBLIC_APP_URL);
  }
  return Array.from(origins);
}

function originFromUrl(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function validateOrigin(req: NextApiRequest): boolean {
  const allowedOrigins = getAllowedOrigins();

  // Sec-Fetch-Site is set by the browser itself and cannot be overridden by
  // page JavaScript, so an explicit cross-site/cross-origin value is a
  // reliable signal to reject outright, regardless of what Origin/Referer say.
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return false;
  }

  // Modern browsers always attach Origin on state-changing requests
  // (POST/PUT/DELETE), same-origin or not. Require it and match it exactly -
  // no "missing header = allowed" fallback.
  const origin = req.headers.origin;
  if (origin) {
    return allowedOrigins.includes(origin);
  }

  // No Origin header at all: fall back to a strict Referer check instead of
  // letting the request through. Compare the actual origin, not a string
  // prefix, so "https://aitrainer.marlonbochi.com.br.evil.com" can't pass.
  const referer = req.headers.referer;
  if (!referer) {
    return false;
  }

  const refererOrigin = originFromUrl(referer);
  return refererOrigin !== null && allowedOrigins.includes(refererOrigin);
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withOriginValidation(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip validation for development environment
    if (process.env.NODE_ENV === 'development') {
      return handler(req, res);
    }

    if (!validateOrigin(req)) {
      return res.status(403).json({ error: 'Forbidden - Invalid origin' });
    }

    return handler(req, res);
  };
}
