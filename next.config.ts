import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Removed next-intl plugin - using custom LanguageContext instead

const nextConfig: NextConfig = {
  // Standalone is for Docker; Vercel + Turbopack fails NFT tracing (next-server.js.nft.json).
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

const sentryOptions: {
  silent: boolean;
  widenClientFileUpload: boolean;
  tunnelRoute?: string;
  webpack?: {
    treeshake?: {
      removeDebugLogging?: boolean;
    };
  };
} = {
  // Source-map upload needs SENTRY_AUTH_TOKEN + org/project — optional locally/CI.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

if (process.env.SENTRY_TUNNEL_ROUTE) {
  sentryOptions.tunnelRoute = process.env.SENTRY_TUNNEL_ROUTE;
}

export default withSentryConfig(nextConfig, sentryOptions);
