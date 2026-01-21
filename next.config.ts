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
        protocol: "http",
        hostname: "localhost",
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
};

export default config;
