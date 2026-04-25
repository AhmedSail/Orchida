import PortfolioGallery from "@/components/PortfolioGallery";
import { db } from "@/src";
import { works, digitalServices } from "@/src/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "معرض أعمال أوركيدة | إبداع لا حدود له",
  description:
    "تصفح معرض أعمالنا في التصميم، التطوير، التسويق، والذكاء الاصطناعي. حلول إبداعية متميزة لكل مشروع.",
  alternates: {
    canonical: "https://www.orchida-ods.com/portfolio",
  },
};

export default async function Page() {
  // جلب كافة الأعمال النشطة مع بيانات الخدمة المرتبطة بها
  const allWorks = await db
    .select({
      id: works.id,
      title: works.title,
      description: works.description,
      category: works.category,
      imageUrl: works.imageUrl,
      type: works.type,
      projectUrl: works.projectUrl,
      priceRange: works.priceRange,
      duration: works.duration,
      tags: works.tags,
      toolsUsed: works.toolsUsed,
      serviceId: works.serviceId,
      serviceName: digitalServices.name,
      youtubeUrl: works.youtubeUrl,
      createdAt: works.createdAt,
    })
    .from(works)
    .leftJoin(digitalServices, eq(works.serviceId, digitalServices.id))
    .where(and(eq(works.isActive, true), isNull(works.deletedAt)))
    .orderBy(desc(works.createdAt));

  // جلب التصنيفات (الخدمات) للفلترة
  const services = await db
    .select({
      id: digitalServices.id,
      name: digitalServices.name,
    })
    .from(digitalServices)
    .where(eq(digitalServices.isActive, true));

  return <PortfolioGallery initialWorks={allWorks} services={services} />;
}
