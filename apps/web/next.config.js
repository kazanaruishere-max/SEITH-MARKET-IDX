/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8181';
    return [
      { source: '/api/v1/:path*', destination: base + '/api/v1/:path*' },
      { source: '/health', destination: base + '/health' },
    ];
  },
};
module.exports = nextConfig;
