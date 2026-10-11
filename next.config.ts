import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second local origin load dev assets, handy for testing with a separate save.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
