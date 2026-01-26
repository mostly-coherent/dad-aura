/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize for Vercel deployment
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Fixed: Use single * for subdomain matching
      },
    ],
  },

  // Security headers
  async headers() {
    try {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
        {
          // Cache static assets
          source: '/favicon.ico',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, immutable',
            },
          ],
        },
      ];
    } catch (error) {
      console.error('Error generating headers:', error);
      // Return empty array on error to prevent build failure
      return [];
    }
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['recharts', 'date-fns'],
  },
};

module.exports = nextConfig;
