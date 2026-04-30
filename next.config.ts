import type { NextConfig } from "next";

const config: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.geminigen.ai",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.ytimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.youtube.com",
        pathname: "**",
      },
    ],
    // هنا مكانها الصحيح
    qualities: [100, 75, 80],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2gb", // زيادة الحد الأقصى لحجم الملفات المرفوعة (للفيديوهات الطويلة)
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://apis.google.com https://www.google-analytics.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com https://maxcdn.bootstrapcdn.com; img-src 'self' data: blob: http://localhost:3000 https://orchida-liard.vercel.app https://www.orchida-liard.vercel.app https://orchida-ods.com https://www.orchida-ods.com https://files.edgestore.dev https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.s3.amazonaws.com https://edge-store.s3.us-east-1.amazonaws.com https://res.cloudinary.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://*.ytimg.com https://s.ytimg.com https://img.youtube.com https://*.youtube.com https://www.google.com https://www.google.jo https://www.google.ps https://iframe.mediadelivery.net https://grainy-gradients.vercel.app; media-src 'self' blob: https://files.edgestore.dev https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.s3.amazonaws.com https://edge-store.s3.us-east-1.amazonaws.com https://res.cloudinary.com https://video.bunnycdn.com https://*.b-cdn.net; connect-src 'self' http://localhost:3000 https://orchida-liard.vercel.app https://www.orchida-liard.vercel.app https://orchida-ods.com https://www.orchida-ods.com https://files.edgestore.dev https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.s3.amazonaws.com https://edge-store.s3.us-east-1.amazonaws.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com https://oauth2.googleapis.com https://www.googleapis.com https://github.com https://api.github.com https://api.emailjs.com https://api.cloudinary.com https://res.cloudinary.com https://vitals.vercel-insights.com https://overbridgenet.com wss://ws-ap2.pusher.com https://sockjs-ap2.pusher.com ws://localhost:3001 http://localhost:3001 wss://*.onrender.com https://orchida-socket.onrender.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://video.bunnycdn.com https://*.b-cdn.net https://fonts.googleapis.com https://use.fontawesome.com https://maxcdn.bootstrapcdn.com https://img.youtube.com https://*.youtube.com https://*.ytimg.com; frame-src 'self' https://accounts.google.com https://apis.google.com https://github.com https://youtube.com https://www.youtube.com https://www.youtube-nocookie.com https://youtu.be https://files.edgestore.dev https://iframe.mediadelivery.net https://*.mediadelivery.net; child-src 'self' https://accounts.google.com https://apis.google.com https://github.com https://youtube.com https://www.youtube.com https://www.youtube-nocookie.com https://youtu.be https://files.edgestore.dev https://iframe.mediadelivery.net https://*.mediadelivery.net; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'none';",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "orchida-ods.com",
          },
        ],
        destination: "https://www.orchida-ods.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;
