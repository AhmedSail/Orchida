import { db } from "@/src";
import { news } from "@/src/db/schema";
import LatestNewsHome from "@/components/latestNewsHome";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| اخر المستجدات",
};
export default async function Page() {
  // ✅ جلب الأخبار من قاعدة البيانات
  const allNews = await db.select().from(news).orderBy(news.publishedAt);

  // ✅ تمرير الأخبار للـ Client Component
  return <LatestNewsHome allNews={allNews} />;
}
