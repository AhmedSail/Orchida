// import { useIsMobile } from "@/hooks/use-mobile";
import NewsPageId from "@/components/NewsPageid";
import { db } from "@/src"; // اتصال drizzle
import { news } from "@/src/db/schema"; // جدول الأخبار
import { eq } from "drizzle-orm";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الخبر",
};
interface PageProps {
  params: { id: string };
}

const eventTypeMap: Record<string, string> = {
  news: "خبر",
  announcement: "إعلان",
  article: "مقال",
  event: "فعالية",
  update: "تحديث",
  blog: "مدونة",
  pressRelease: "بيان صحفي",
  promotion: "عرض ترويجي",
  alert: "تنبيه",
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // ✅ جلب الخبر المطلوب
  const FoundNews = await db.select().from(news).where(eq(news.id, id));

  // ✅ جلب كل الأخبار (للعناوين)
  const allNews = await db.select().from(news).orderBy(news.publishedAt);
  const headlines = allNews.map((n) => n.title);

  return <NewsPageId FoundNews={FoundNews[0]} headlines={headlines} />;
}
