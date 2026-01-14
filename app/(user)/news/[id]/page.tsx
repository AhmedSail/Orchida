// import { useIsMobile } from "@/hooks/use-mobile";
import NewsPageId from "@/components/NewsPageid";
import { db } from "@/src"; // اتصال drizzle
import { news } from "@/src/db/schema"; // جدول الأخبار
import { eq } from "drizzle-orm";

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const itemRaw = await db
    .select({
      title: news.title,
      summary: news.summary,
    })
    .from(news)
    .where(eq(news.id, id))
    .limit(1);

  const item = itemRaw[0];

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

  return {
    title: item?.title ? `${item.title} | اوركيدة` : "المركز الإعلامي",
    description: item?.summary || "آخر أخبار ومستجدات اوركيدة",
    alternates: {
      canonical: `${baseUrl}/news/${id}`,
    },
  };
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

export default async function Page({ params }: { params: { id: string } }) {
  const param = await params;

  // ✅ جلب الخبر المطلوب
  const FoundNews = await db.select().from(news).where(eq(news.id, param.id));

  // ✅ جلب كل الأخبار (للعناوين)
  const allNews = await db.select().from(news).orderBy(news.publishedAt);
  const headlines = allNews.map((n) => n.title);

  return <NewsPageId FoundNews={FoundNews[0]} headlines={headlines} />;
}
