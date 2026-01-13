import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://orchida-ods.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/coordinator/",
        "/attractor/",
        "/content_creator/",
        "/instructor/",
        "/dashboardUser/",
        "/api/",
        "/_next/static/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
