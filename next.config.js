/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  // Add any other PWA configurations here
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable CSS optimizations
    styledComponents: true,
  },
  experimental: {
    // Enable CSS optimizations
    optimizeCss: true,
  },
  // Enable static exports for static site generation
  output: 'standalone',
  // Disable React's Strict Mode for development
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

module.exports = process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig);
