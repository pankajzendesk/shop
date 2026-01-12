/** @type {import('next').NextConfig} */
const enableDevTools = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";

const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',
  devIndicators: enableDevTools ? {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  } : false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  /*
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'img.rocket.new',
      },
    ],
  },
  webpack(config) {
    if (enableDevTools) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });
    }
    return config;
  },
};

export default nextConfig;
