import { MetadataRoute } from "next";
import { db } from "@/src/db";
import { digitalServices, courses, works } from "@/src/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

  // Fetch all dynamic IDs
  const allServices = await db
    .select({ id: digitalServices.id })
    .from(digitalServices);
  const allCourses = await db.select({ id: courses.id }).from(courses);
  const allWorks = await db.select({ id: works.id }).from(works);

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Dynamic routes: Services (Works only)
  allServices.forEach((service) => {
    // Works filtered by service
    routes.push({
      url: `${baseUrl}/services/${service.id}/works`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Dynamic routes: Courses
  allCourses.forEach((course) => {
    routes.push({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    routes.push({
      url: `${baseUrl}/courses/${course.id}/register`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Dynamic routes: Individual Work Pages
  allWorks.forEach((work) => {
    routes.push({
      url: `${baseUrl}/workPage/${work.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return routes;
}
