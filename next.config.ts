import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-2daf0c43defe48578bf035255fa13a2d.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '3a0d360b8b0dfe15daef4ca257faa06e.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
