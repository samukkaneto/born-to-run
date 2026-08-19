import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://nmcaejrmmfffzeclmuob.supabase.co; font-src 'self' data:; connect-src 'self' https://nmcaejrmmfffzeclmuob.supabase.co wss://nmcaejrmmfffzeclmuob.supabase.co https://va.vercel-scripts.com; worker-src 'self' blob:; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '16mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nmcaejrmmfffzeclmuob.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: 'nmcaejrmmfffzeclmuob.supabase.co',
        pathname: '/storage/v1/object/public/gallery/**',
      },
    ],
  },
}

export default nextConfig
