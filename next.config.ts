/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**", // يسمح بكل المسارات
      },
      {
        protocol: "https",
        hostname: "files.edgestore.dev", // الدومين اللي ظهر في الخطأ
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // صور Google profile
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost", // صور محلية أثناء التطوير
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
