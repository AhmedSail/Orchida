"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { NewsType } from "../view/home-view";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Tag,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

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

export default function LatestNewsUser({ news }: { news: NewsType[] }) {
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async (item: NewsType) => {
    try {
      setButtonLoading(item.id);
      await router.push(`/news/${item.id}`);
      setButtonLoading(null);
    } catch (error) {
      console.error("Navigation error:", error);
      setButtonLoading(null);
    }
  };

  const activeNews = [...news]
    .filter((item) => item.isActive)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5); // Increased slice to 5 for better slider experience

  if (!activeNews.length) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3"
        >
          <div className="w-1.5 h-10 bg-primary rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            آخر <span className="text-primary">الأحداث</span>
          </h2>
        </motion.div>

        {/* Navigation Buttons for Desktop */}
        <div className="hidden md:flex gap-2">
          <button className="swiper-button-prev-custom w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
          <button className="swiper-button-next-custom w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div>
        <Swiper
          modules={[Pagination, EffectFade, Autoplay, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          className="custom-swiper relative w-full rounded-3xl shadow-2xl overflow-hidden bg-white"
          style={{ paddingBottom: "0" }}
        >
          {activeNews.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                {/* Image Section */}
                <div className="relative h-64 lg:h-auto overflow-hidden group">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                      <span className="text-6xl font-bold opacity-20">
                        Orchida
                      </span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/50 lg:to-transparent opacity-80" />

                  {/* Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Tag size={16} />
                      {eventTypeMap[item.eventType] || item.eventType}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative p-8 md:p-12 flex flex-col justify-center bg-white lg:bg-gradient-to-br lg:from-white lg:to-gray-50/50">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-2 text-gray-500 mb-4 font-medium">
                      <Calendar size={18} className="text-primary" />
                      <span>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(
                              "ar-EG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-3 md:line-clamp-4">
                      {item.summary || "لا يوجد وصف متاح لهذا الحدث."}
                    </p>

                    <div className="flex items-center gap-4">
                      {buttonLoading === item.id ? (
                        <div className="h-12 w-40 flex items-center justify-center bg-primary/10 rounded-xl">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleClick(item)}
                          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 text-lg group"
                        >
                          <span>اقرأ التفاصيل</span>
                          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>

                  {/* Decorative Elements */}
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl -z-10" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
