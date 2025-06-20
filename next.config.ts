import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robohash.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.linkedin.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jrxdpeflijzlytesvdwd.supabase.co",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;