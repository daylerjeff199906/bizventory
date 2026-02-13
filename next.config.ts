import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3a0d360b8b0dfe15daef4ca257faa06e.r2.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
