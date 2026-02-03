import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Fix for Zod locale imports in Turbopack/Next.js 16
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  transpilePackages: ['zod'],
};

export default withNextIntl(nextConfig);
