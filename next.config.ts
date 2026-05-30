import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'toey-sawatdee.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd3fs8bw8fuf5n4.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.toey-sawatdee.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'toey-sawatdee-assets-prod.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'toey-sawatdee-assets-prod.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/api/scan': ['./demo-workspace/**/*'],
    '/api/scan-upload': ['./demo-workspace/**/*'],
  },
  async headers() {
    return [
      {
        // Prevent CloudFront from caching dynamic HTML pages
        source: '/status',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        // Health API must always be fresh
        source: '/api/status/health',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
