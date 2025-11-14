import { NextApiRequest, NextApiResponse } from 'next';

// List of allowed origins (add your production domain here)
const ALLOWED_ORIGINS = [
  'aitrainer.marlonbochi.com.br',
  'projects.vercel.app',
  // Add other domains as needed
];

function validateOrigin(req: NextApiRequest) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Check if the referer is from an allowed origin
  const isRefererAllowed = !referer || 
    ALLOWED_ORIGINS.some(allowed => 
      new RegExp(allowed, 'i').test(referer)
    );

  return isRefererAllowed;
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
