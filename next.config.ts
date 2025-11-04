import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add the images configuration here
  images: {
    // This allows all external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // wildcard — allows all domains
      },
    ],
    unoptimized: true, // ✅ skip optimization so all URLs work
  },
  
  // Existing configurations below
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;