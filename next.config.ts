import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Cloudinary already holds the originals, so it resizes and format-negotiates
    // them directly (see src/lib/imageLoader.ts). Non-Cloudinary sources still
    // fall through to Next's own optimizer inside that loader.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
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
          // Content-Security-Policy is deliberately NOT set here. It is built
          // per request in src/proxy.ts from the admin-managed script allowlist
          // — a browser intersects two CSP headers, so the static one has to
          // stay gone for the dynamic one to have any effect.
        ],
      },
    ];
  },
};

export default nextConfig;
