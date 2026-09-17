/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: 'http://127.0.0.1:8181/api/v1/:path*' },
      { source: '/health', destination: 'http://127.0.0.1:8181/health' },
    ];
  },
};
module.exports = nextConfig;
