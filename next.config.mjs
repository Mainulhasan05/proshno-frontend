/** @type {import('next').NextConfig} */

// Hosts allowed to be fetched and optimised by /_next/image.
//
// This list must stay tight. `hostname: '**'` (the previous value, for both https *and*
// http) turns the image optimiser into an open proxy: any third party can pass arbitrary
// URLs through it, consuming this server's bandwidth and CPU, and `**` also permits
// internal addresses reachable from the server — an SSRF surface.
//
// Extra hosts can be supplied per environment via IMAGE_ALLOWED_HOSTS, comma-separated.
const DEFAULT_IMAGE_HOSTS = ['cdn.proshnopedia.com'];

const imageHosts = [
  ...DEFAULT_IMAGE_HOSTS,
  ...(process.env.IMAGE_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean),
];

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
      port: '',
      pathname: '/**',
    })),
  },
  compress: true,
  transpilePackages: ['katex'],
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion', 'katex'],
  },
};

export default nextConfig;
