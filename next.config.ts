import path from 'path'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* your existing config options stay exactly as they are */
  
  // Simply add this images configuration:
  images: {
    domains: ['placehold.co'], // Whitelist placeholder image domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**', // Allow all paths
      },
    ],
  },
  
};

export default nextConfig;