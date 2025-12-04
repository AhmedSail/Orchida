// import { useIsMobile } from "@/hooks/use-mobile";
import NewsTicker from "@/components/NewsTicker";
import { db } from "@/src"; // اتصال drizzle
import { news } from "@/src/db/schema"; // جدول الأخبار
import { eq } from "drizzle-orm";
import Image from "next/image";

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
  const [item] = await db.select().from(news).where(eq(news.id, id));

  // ✅ جلب كل الأخبار (للعناوين)
  const allNews = await db.select().from(news).orderBy(news.publishedAt);
  const headlines = allNews.map((n) => n.title);

  if (!item) {
    return (
      <div className="container mx-auto p-10 text-center text-red-500">
        لم يتم العثور على الخبر المطلوب
      </div>
    );
  }

  return (
    <div>
      {/* شريط الأخبار */}
      <NewsTicker headlines={headlines} />

      <div className="container mx-auto" dir="rtl">
        <div className="container mx-auto p-6 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* شارة نوع الحدث */}

          {/* الصورة مع شارة نوع الحدث */}
          <div className="w-full h-full rounded-xl overflow-hidden relative shadow-2xl shadow-primary group">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1000}
                height={500}
                className="
        object-cover 
        transition-transform duration-500 ease-out
        group-hover:scale-105 group-hover:rotate-1 group-hover:translate-y-1
      "
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            <span className="block bg-primary text-white font-semibold px-4 py-2 w-1/2 rotate-45 text-center absolute max-md:top-5 md:top-10 -right-13">
              {eventTypeMap[item.eventType] || item.eventType}
            </span>
          </div>

          <div className="flex flex-col gap-6  rounded-lg p-10">
            {/* العنوان والتاريخ */}
            <div className="flex gap-2 items-center ">
              <h1 className="text-xl font-bold text-gray-900 mb-2">العنوان:</h1>
              <h1 className="text-xl font-bold text-primary mb-2">
                {item.title}
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                تاريخ النشر:
              </h1>
              <p className="text-xl font-bold text-primary mb-4">
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                  : "—"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <h1 className="text-xl font-bold text-gray-900 ">الملخص:</h1>
              {/* الملخص */}
              {item.summary && (
                <p className="text-xl font-bold text-primary">{item.summary}</p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <h1 className="text-xl font-bold text-gray-900 ">المحتوى:</h1>
              {/* المحتوى */}
              {item.content && (
                <div className="text-xl font-bold text-primary">
                  {item.content}
                </div>
              )}
            </div>
          </div>

          {/* المحتوى */}
        </div>
      </div>
    </div>
  );
}
