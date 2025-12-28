import ServicePage from "@/components/user/service/servicePage";
import { db } from "@/src";
import { digitalServices, works, mediaFiles } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const metadata = {
  title: "اوركيدة | الخدمات الرقمية",
  description: "خدماتنا",
};

const page = async () => {
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

  return (
    <div className="container mx-auto">
      <ServicePage services={services} allWorks={allWorks} />
    </div>
  );
};

export default page;
