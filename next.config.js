/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'dono-03.danbot.host',
    '*.danbot.host',
    '**.danbot.host',
    'omsenjalia.me',
    '*.omsenjalia.me',
    '**.omsenjalia.me',
  ],
  turbopack: {
    root: process.cwd(),
  },
};

module.exports = nextConfig;
