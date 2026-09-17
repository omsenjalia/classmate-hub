/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'dono-03.danbot.host',
    '*.danbot.host',
    'dono-03.danbot.host:*',
    'http://dono-03.danbot.host',
    'https://dono-03.danbot.host',
    '*.omsenjalia.me'
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
