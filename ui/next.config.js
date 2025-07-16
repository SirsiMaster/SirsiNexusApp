/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Configure for GitHub Pages static export
  output: 'export',
  trailingSlash: true,
  basePath: '/SirsiNexus',
  assetPrefix: '/SirsiNexus',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sirsinexus.com',
      },
      {
        protocol: 'https',
        hostname: 'sirsinexus-assets.com',
      },
    ],
  },

  // Note: API rewrites disabled for static export
  // Backend communication will need to be handled differently

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
