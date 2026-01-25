
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
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    allowedDevOrigins: [
        '6000-firebase-studio-1762003255233.cluster-aic6jbiihrhmyrqafasatvzbwe.cloudworkstations.dev'
    ]
  }
};

export default nextConfig;
