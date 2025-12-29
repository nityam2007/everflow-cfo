/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Strict mode for development
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  
  /**
   * Security Headers Configuration
   * Applied at the CDN/edge level for optimal performance
   * Reference: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
   */
  async headers() {
    // Security headers for all routes
    const securityHeaders = [
      // Prevent clickjacking attacks
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Prevent MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Control referrer information leakage
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Disable browser features for security (updated for modern browsers)
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      },
      // Prevent DNS prefetching leaks
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
    ];

    // Production-only headers
    const productionHeaders = process.env.NODE_ENV === 'production' ? [
      // Force HTTPS for 1 year with preload
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      // Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js hydration
          "style-src 'self' 'unsafe-inline'", // Required for Tailwind/styled-jsx
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ] : [];

    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [...securityHeaders, ...productionHeaders],
      },
      {
        // Stricter headers for API routes
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          ...productionHeaders,
          // Prevent caching of API responses with sensitive data
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
