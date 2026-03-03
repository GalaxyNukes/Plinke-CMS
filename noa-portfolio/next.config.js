/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Silence Sanity Studio warnings in build
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
