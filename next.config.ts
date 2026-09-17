import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["dono-03.danbot.host"],
  turbopack: {
    // Keep package discovery inside this repository even when a parent folder
    // contains another lockfile.
    root: process.cwd(),
  },
};

export default nextConfig;
