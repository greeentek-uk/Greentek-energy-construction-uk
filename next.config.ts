import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.openwidget.com https://api.openwidget.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.google.com https://*.gstatic.com https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://api.openwidget.com https://api.livechatinc.com https://api.cloudinary.com; frame-src 'self' https://www.google.com https://cdn.openwidget.com https://secure.livechatinc.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
