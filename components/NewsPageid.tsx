import NewsTicker from "@/components/NewsTicker";
import { db } from "@/src";
import { news } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { News } from "./news/LatestNews";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

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
  function renderContent(content: string) {
    // نقسم النص حسب المسافات
    const parts = content.split(/\s+/);

    return parts.map((part, i) => {
      if (part.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // صورة
        return (
          <img
            key={i}
            src={part}
            alt="content media"
            className="rounded-md my-2 max-w-full"
          />
        );
      } else if (part.includes("youtube.com") || part.includes("youtu.be")) {
        // يوتيوب
        const videoId = part.includes("watch?v=")
          ? part.split("watch?v=")[1].split("&")[0]
          : part.split("youtu.be/")[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <iframe
            key={i}
            src={embedUrl}
            className="w-full aspect-video rounded-md my-2"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      } else if (part.match(/\.(mp4|webm)$/i)) {
        // فيديو مرفوع
        return (
          <video
            key={i}
            src={part}
            controls
            className="rounded-md my-2 max-w-full"
          />
        );
      } else {
        // نص عادي
        return <span key={i}>{part} </span>;
      }
    });
  }
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
        </div>
      </div>
      {FoundNews.content && (
        <div className="container mx-auto" dir="rtl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="content">
              <AccordionTrigger>
                <div className="flex justify-start items-center gap-3">
                  <h1 className="text-primary text-xl lg:text-3xl font-bold">
                    المحتوى
                  </h1>
                  <span className="text-gray-500">(اضغط للعرض)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2 items-center">
                  <div className="prose max-w-full">
                    {renderContent(FoundNews.content || "")}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
