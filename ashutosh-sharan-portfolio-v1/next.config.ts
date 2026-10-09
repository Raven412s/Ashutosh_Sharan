import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Barrel-file import optimization: loads only the exact symbols imported instead of the full library index
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "gsap",
      "@gsap/react",
      "lenis",
      "react-icons",
      "framer-motion",
    ],
  },

  // High-performance image optimization formats & caching
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  // Strip console logs in production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default withNextIntl(nextConfig);
