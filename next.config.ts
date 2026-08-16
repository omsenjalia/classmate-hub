import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep package discovery inside this repository even when a parent folder
    // contains another lockfile.
    root: process.cwd(),
  },
};

export default nextConfig;
