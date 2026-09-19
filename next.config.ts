
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.getaroom-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.dropbox.com',
      }
    ],
  },
};

export default nextConfig;
