"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// سبينر بسيط
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  );
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  eventType: string;
  isActive: boolean;
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

export default function LatestNewsUser() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null); // ✅ حالة الزر

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const data = await res.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const activeNews = [...newsData]
    .filter((item) => item.isActive)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <motion.h1
        className="text-3xl font-bold text-primary mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        آخر الأحداث
      </motion.h1>

      <Swiper
        modules={[Pagination, EffectFade]}
        spaceBetween={30}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        pagination={{ clickable: true }}
        className="blog-slider"
      >
        {activeNews.map((item) => (
          <SwiperSlide key={item.id}>
            <motion.div
              className="flex flex-col md:grid md:grid-cols-2 items-center gap-6"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              {/* الصورة */}
              <motion.div
                className="relative h-72 rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={300}
                    height={300}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}

                {/* شارة نوع الحدث */}
                <motion.span
                  className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {eventTypeMap[item.eventType] || item.eventType}
                </motion.span>
              </motion.div>

              {/* المحتوى */}
              <motion.div
                className="flex flex-col gap-3 mr-3"
                dir="rtl"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 font-medium">
                    تاريخ النشر:
                  </span>
                  <span className="text-gray-500 font-medium">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.summary ? item.summary.split(".")[0] + "." : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {eventTypeMap[item.eventType] || item.eventType}
                </p>

                {/* زر مع سبينر */}
                <Button
                  variant="default"
                  size="sm"
                  className="cursor-pointer w-full mt-10 flex items-center justify-center"
                  onClick={() => {
                    setButtonLoading(item.id);
                    // محاكاة تحميل قصير قبل الانتقال
                    setTimeout(() => {
                      window.location.href = `/news/${item.id}`;
                    }, 1000);
                  }}
                >
                  {buttonLoading === item.id ? (
                    <Spinner />
                  ) : (
                    <span>اقرا المزيد</span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
