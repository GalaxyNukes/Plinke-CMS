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
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          // Stop MIME-type sniffing
          { key: "X-Content-Type-Options",    value: "nosniff" },
          // Referrer — don't leak URL to third parties
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          // Restrict powerful APIs to same-origin only
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          // Force HTTPS for 1 year (only meaningful in prod, harmless in dev)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // XSS protection for older browsers
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          // CSP — allow Sanity Studio, Google Fonts, Vercel Analytics, same-origin media
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Sanity + Vercel analytics inline
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://www.googletagmanager.com",
              // Styles: self + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Sanity CDN + data URIs
              "img-src 'self' data: blob: https://cdn.sanity.io",
              // Media (video/audio): self + Sanity CDN
              "media-src 'self' blob: https://cdn.sanity.io",
              // Frames: YouTube + Vimeo for video embeds
              "frame-src https://www.youtube.com https://player.vimeo.com",
              // API/fetch: self + Sanity API + Sanity CDN
              "connect-src 'self' blob: https://*.sanity.io wss://*.sanity.io https://cdn.sanity.io https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com",
              // Workers (used by Sanity Studio)
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
      // Allow the proxy-glb route to return cross-origin content for Three.js
      {
        source: "/api/proxy-glb",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
