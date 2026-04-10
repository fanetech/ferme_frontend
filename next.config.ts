import type { NextConfig } from "next";
import { config } from "dotenv";

config();

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: process.env.API_URL || "localhost"
      },
    ]
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:8081/api';
    return [
      {
        // Proxy all /api/* requests to the backend — avoids CORS in development
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
