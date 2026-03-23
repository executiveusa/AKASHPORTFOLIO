import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Root "/" serves the public Kupuri Media landing (from public/index.html)
        { source: '/', destination: '/index.html' },
      ],
    };
  },
};

export default nextConfig;
