import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Ignora erros de tipos no momento do build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros de lint no momento do build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
