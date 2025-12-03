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
  // Explicitly configure Turbopack
  turbopack: {},
  // Keep webpack configuration for build time
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations here
    return config;
  },
  // Enable static exports for static site generation
  output: 'standalone',
};

// Remove the empty eslint configuration from the config
delete nextConfig.eslint;

module.exports = withPWA(nextConfig);