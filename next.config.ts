/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // السماح بعرض الصور من Cloudinary
  },
};

module.exports = nextConfig;
