"use client";
import React from "react";
import NewsTicker from "@/components/NewsTicker";
import Image from "next/image";
import { News } from "./news/LatestNews";
import { Calendar, Tag, Share2, ArrowRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  const router = useRouter();

  // دالة معالجة المحتوى لعرض الصور والفيديو والنص بشكل منسق
  function renderContent(content: string) {
    if (!content) return null;

    // تقسيم النص والاحتفاظ بالروابط ككيانات منفصلة
    const parts = content.split(/(\s+)/);

    return parts.map((part, i) => {
      // إزالة المسافات الزائدة للتحقق من الرابط
      const cleanPart = part.trim();

      if (cleanPart.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // صورة
        return (
          <div
            key={i}
            className="my-8 relative w-full h-auto max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-100"
          >
            <Image
              src={cleanPart}
              width={1000}
              height={1000}
              alt="Content Image"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        );
      } else if (
        cleanPart.includes("youtube.com") ||
        cleanPart.includes("youtu.be")
      ) {
        // يوتيوب
        let videoId = "";
        try {
          if (cleanPart.includes("watch?v=")) {
            videoId = cleanPart.split("watch?v=")[1].split("&")[0];
          } else if (cleanPart.includes("youtu.be/")) {
            videoId = cleanPart.split("youtu.be/")[1];
          }
        } catch (e) {
          console.error("Error parsing YouTube URL", e);
          return (
            <a
              href={cleanPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline wrap-break-word"
              key={i}
            >
              {part}
            </a>
          );
        }

        if (!videoId) return <span key={i}>{part}</span>;

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <div
            key={i}
            className="my-8 relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-primary/10"
          >
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else if (cleanPart.match(/\.(mp4|webm)$/i)) {
        // فيديو مرفوع
        return (
          <div
            key={i}
            className="my-8 relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg"
          >
            <video src={cleanPart} controls className="w-full h-auto" />
          </div>
        );
      } else {
        // نص عادي - نعيده كما هو مع المسافات
        return (
          <span key={i} className="leading-relaxed text-gray-700 text-lg">
            {part}
          </span>
        );
      }
    });
  }

  if (!FoundNews) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center container mx-auto p-10 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          عذراً، لم يتم العثور على الخبر
        </h2>
        <p className="text-gray-500 mb-6">
          قد يكون الرابط غير صحيح أو تمت إزالة المحتوى.
        </p>
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className=" pb-20 font-sans text-right" dir="rtl">
      {/* شريط الأخبار */}
      <NewsTicker headlines={headlines} />

      {/* Hero Header */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden mb-12">
        {/* Background Image with Blur */}
        {FoundNews.imageUrl && (
          <div className="absolute inset-0 w-full h-full opacity-50 blur-sm scale-105">
            <Image
              src={FoundNews.imageUrl}
              alt="Background"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent" />

        {/* Title Content */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 backdrop-blur-md shadow-sm">
                <Tag size={14} />
                {eventTypeMap[FoundNews.eventType] || FoundNews.eventType}
              </span>
              {FoundNews.publishedAt && (
                <span className="text-gray-300 flex items-center gap-1 text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Calendar size={14} />
                  {new Date(FoundNews.publishedAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg mb-6">
              {FoundNews.title}
            </h1>

            {FoundNews.summary && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
                <p className="text-lg md:text-xl text-gray-100 font-medium leading-relaxed">
                  {FoundNews.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Image */}
          {FoundNews.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200"
            >
              <Image
                src={FoundNews.imageUrl}
                alt={FoundNews.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
            </motion.div>
          )}

          {/* Content Body */}
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary prose-img:rounded-xl">
            {FoundNews.content ? (
              <div className="text-gray-800 leading-8 whitespace-pre-wrap">
                {renderContent(FoundNews.content)}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic py-10">
                لا يوجد محتوى إضافي لعرضه.
              </p>
            )}
          </article>

          {/* Footer / Share */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-8">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.back()}
            >
              <ArrowRight size={16} />
              العودة للأخبار
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">
                مشاركة الخبر:
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600"
                >
                  <Share2 size={18} />
                </Button>
                {/* Add actual share functionality here later */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
