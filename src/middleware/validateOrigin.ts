import { NextApiRequest, NextApiResponse } from 'next';

// List of allowed origins (add your production domain here)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://aitrainer.marlonbochi.com.br',
  // Add other domains as needed
];

function validateOrigin(req: NextApiRequest) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Get the host from environment variables or use a default
  const host = process.env.NEXT_PUBLIC_APP_URL || 'https://aitrainer.marlonbochi.com.br';
  
  // Check if the request is coming from the same origin
  const isSameOrigin = !origin || origin === host;
  
  // Check if the referer is from an allowed origin
  const isRefererAllowed = !referer || 
    ALLOWED_ORIGINS.some(allowed => 
      referer.startsWith(allowed)
    );

  return isSameOrigin && isRefererAllowed;
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withOriginValidation(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip validation for development environment
    if (process.env.NODE_ENV === 'development') {
      return handler(req, res);
    }

    const isValid = validateOrigin(req);
    
    if (!isValid) {
      return res.status(403).json({ error: 'Forbidden - Invalid origin' });
    }

    return handler(req, res);
  };
}
