import type { NextConfig } from 'next';

// Removed next-intl plugin - using custom LanguageContext instead

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
