import ServicePage from "@/components/user/service/servicePage";
import { db } from "@/src";
import { digitalServices, works, mediaFiles } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const metadata = {
  title: "اوركيدة | الخدمات الرقمية",
  description: "اكتشف خدماتنا الرقمية المتنوعة في التصميم، التطوير، والتسويق.",
  alternates: {
    canonical: "https://www.orchida-ods.com/services",
  },
};

import JsonLd from "@/components/ui/JsonLd";

const page = async () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";
  const services = await db.select().from(digitalServices);

  const allWorks = await db
    .select({
      id: works.id,
      title: works.title,
      description: works.description,
      category: works.category,
      duration: works.duration,
      serviceId: works.serviceId,
      projectUrl: works.projectUrl,
      priceRange: works.priceRange,
      tags: works.tags,
      toolsUsed: works.toolsUsed,
      isActive: works.isActive,
      imageUrl: works.imageUrl,
      type: works.type,
      createdAt: works.createdAt,
      updatedAt: works.updatedAt,
      deletedAt: works.deletedAt,
      uploadDate: works.uploadDate,
    })
    .from(works)
    .where(and(eq(works.isActive, true), isNull(works.deletedAt)))
    .orderBy(works.createdAt);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      description: service.description,
      url: `${baseUrl}/services/${service.id}/works`,
    })),
  };

  return (
    <div className="container mx-auto">
      <JsonLd data={itemListJsonLd} />
      <ServicePage services={services} allWorks={allWorks} />
    </div>
  );
};

export default page;
