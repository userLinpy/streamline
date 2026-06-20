import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // marked v14 is ESM-only ("type": "module") — Turbopack crashes trying to bundle
  // marked.esm.js server-side. Externalizing lets Node.js load marked.cjs natively.
  serverExternalPackages: ['marked'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
