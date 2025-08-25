/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // ✅ Ignore Supabase Realtime warning
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/, message: /Critical dependency/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
