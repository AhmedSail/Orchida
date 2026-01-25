import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أوركيدة للخدمات الرقمية والأكاديمية",
    short_name: "أوركيدة",
    description:
      "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
