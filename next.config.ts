import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: the dev server rejects cross-origin requests to its internal
  // resources (e.g. /__nextjs_original-stack-frames) by default. When the
  // app is previewed through an external hostname/reverse proxy, that host
  // must be listed here. Extra hosts can be added at runtime via the
  // NEXT_ALLOWED_DEV_ORIGINS env var (comma-separated).
  allowedDevOrigins: [
    "dono-03.danbot.host",
    ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ],
  turbopack: {
    // Keep package discovery inside this repository even when a parent folder
    // contains another lockfile.
    root: process.cwd(),
  },
};

export default nextConfig;
