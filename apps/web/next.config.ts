import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  transpilePackages: ["@ponp/event-bus", "@ponp/participant"],
};

export default nextConfig;
