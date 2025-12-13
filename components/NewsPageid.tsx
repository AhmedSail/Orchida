import NewsTicker from "@/components/NewsTicker";
import { db } from "@/src";
import { news } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { News } from "./news/LatestNews";

interface PageProps {
  FoundNews: News;
  headlines: string[];
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

export default function NewsPageId({ FoundNews, headlines }: PageProps) {
  if (!FoundNews) {
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

      <div
        className="container mx-auto p-6 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
        dir="rtl"
      >
        {/* الصورة مع شارة نوع الحدث */}
        <div className="w-full h-full rounded-xl overflow-hidden relative shadow-lg shadow-primary group">
          {FoundNews.imageUrl ? (
            <Image
              src={FoundNews.imageUrl}
              alt={FoundNews.title}
              width={800}
              height={400}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy" // ✅ أفضل للأداء
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <span className="block bg-primary text-white font-semibold px-4 py-2 w-1/2 rotate-45 text-center absolute top-5 -right-12">
            {eventTypeMap[FoundNews.eventType] || FoundNews.eventType}
          </span>
        </div>

        {/* تفاصيل الخبر */}
        <div className="flex flex-col gap-6 rounded-lg p-6">
          <div className="flex gap-2 items-center">
            <span className="text-lg font-bold text-gray-900">العنوان:</span>
            <span className="text-lg font-bold text-primary">
              {FoundNews.title}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-lg font-bold text-gray-900">
              تاريخ النشر:
            </span>
            <span className="text-lg font-bold text-primary">
              {FoundNews.publishedAt
                ? new Date(FoundNews.publishedAt).toLocaleDateString("ar-EG")
                : "—"}
            </span>
          </div>
          {FoundNews.summary && (
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold text-gray-900">الملخص:</span>
              <p className="text-lg text-primary">{FoundNews.summary}</p>
            </div>
          )}
          {FoundNews.content && (
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold text-gray-900">المحتوى:</span>
              <p className="text-lg text-primary">{FoundNews.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
