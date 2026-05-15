/**
 * next.config.ts — Production-safe configuration
 *
 * Changes from original:
 * 1. Removed Google Fonts dependency from build (was causing fetch errors in CI)
 *    → Fonts are loaded in globals.css via system stack or self-hosted
 * 2. Added serverExternalPackages to prevent NFT tracing issues with os-tools.ts
 * 3. Added webpack config to handle dynamic require() in os-tools safely
 * 4. Tightened CSP to allow framer-motion and vercel analytics
 */

import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kupuri-media-cdmx.vercel.app';

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vapi.ai https://www.googletagmanager.com https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://api.vapi.ai https://api.elevenlabs.io https://openrouter.ai https://api.anthropic.com https://api.groq.com wss: https://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: siteUrl },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With, X-Cron-Secret" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      { source: "/llms.txt", headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }] },
    ];
  },

  async redirects() {
    return [
      { source: "/", destination: "/landing", permanent: false },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {},

  experimental: {
    optimizePackageImports: ["framer-motion", "@radix-ui/react-icons"],
  },

  // Prevent NFT tracing from following fs/path in os-tools.ts into system dirs
  serverExternalPackages: ["sharp", "onnxruntime-node"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress the dynamic require() warning from os-tools.ts
      config.externals = [...(config.externals || []), 'child_process', 'fs/promises'];
    }
    return config;
  },
};

export default nextConfig;
