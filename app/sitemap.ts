import { MetadataRoute } from "next";
import { db } from "@/src/db";
import { courses, news, digitalServices } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/courses",
    "/latest",
    "/services",
    "/trending",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // Dynamic routes: Courses
    const coursesData = await db
      .select({ id: courses.id, updatedAt: courses.updatedAt })
      .from(courses)
      .where(eq(courses.isActive, true));

    const courseRoutes = coursesData.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Dynamic routes: News/Latest
    const newsData = await db
      .select({ id: news.id, updatedAt: news.updatedAt })
      .from(news)
      .where(eq(news.isActive, true));

    const newsRoutes = newsData.map((item) => ({
      url: `${baseUrl}/latest/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Dynamic routes: Digital Services
    const servicesData = await db
      .select({ id: digitalServices.id, updatedAt: digitalServices.updatedAt })
      .from(digitalServices)
      .where(eq(digitalServices.isActive, true));

    const serviceRoutes = servicesData.map((service) => ({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: service.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...courseRoutes,
      ...newsRoutes,
      ...serviceRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
