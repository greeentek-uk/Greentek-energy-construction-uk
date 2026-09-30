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
    // How long Vercel keeps each resized copy of a /public image (and tells
    // browsers they can). It was the default, so optimised images went out
    // with max-age=0 and were re-transformed often — spending the plan's
    // image-optimisation allowance and bandwidth on the same few files.
    minimumCacheTTL: 2592000, // 30 days
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
        // Photos, backgrounds and icons in /public were sent with max-age=0,
        // so every visit re-checked or re-downloaded them. A week in the
        // browser (a day of serving stale while it refreshes) is safe for
        // files that only change with a deploy — one replaced under the same
        // name shows up for returning visitors within the week.
        source: "/:dir(images|animations)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
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
