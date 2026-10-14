import withSerwistInit from '@serwist/next';

const isDev = process.env.NODE_ENV === 'development';

// Service worker source: src/sw.ts. The build writes the precache manifest
// into it and emits public/sw.js (git-ignored). Disabled in development.
const withPWA = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: isDev,
  // The previous setup never reloaded the page when the connection came back;
  // a reload would also discard a half-filled form.
  reloadOnOnline: false,
});

// Next.js inlines its hydration scripts and critical CSS, so 'unsafe-inline' is
// required until nonces are introduced (that needs dynamic rendering).
// React's dev tooling needs eval, so the CSP is production-only.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  ...(isDev ? [] : [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
  },
  output: 'standalone',
  turbopack: {},
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // Generated plans can contain personal data: never let a cache keep them.
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default isDev ? nextConfig : withPWA(nextConfig);
