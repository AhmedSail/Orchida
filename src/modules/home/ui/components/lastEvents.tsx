"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { NewsType } from "../view/home-view";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Minus,
} from "lucide-react";

const eventTypeMap: Record<string, string> = {
  news: "خبر عاجل",
  announcement: "إعلان هام",
  article: "مقال مميز",
  event: "فعالية قادمة",
  update: "تحديث جديد",
  blog: "مدونة",
  pressRelease: "بيان صحفي",
  promotion: "عرض خاص",
  alert: "تنبيه",
  competition: "مسابقة",
  workshop: "ورشة عمل",
  story: "قصة نجاح",
};

// 🎬 أنيميشن كشف النص الفاخر
const revealVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
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
      setButtonLoading(null);
    }
  };

  const activeNews = [...news]
    .filter((item) => item.isActive)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (!activeNews.length) return null;

  return (
    <div
      className="w-full h-screen  relative overflow-hidden font-sans"
      dir="rtl"
    >
      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        effect="fade"
        speed={1000}
        loop={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
        className="w-full h-full"
      >
        {activeNews.map((item, index) => (
          <SwiperSlide
            key={item.id}
            className="relative w-full h-full bg-[#e9e9e9] "
          >
            <div className="flex flex-col lg:flex-row w-full h-full">
              {/* 📝 قسم البيانات (45% Width - Right Side) */}
              <div className="w-full lg:w-[70%] h-full flex flex-col justify-center relative px-8 lg:px-24 z-20 ">
                {/* رقم الشريحة بالخلفية كعنصر جمالي */}
                <div className="absolute top-20 right-10 text-[15rem] font-black text-primary/60 select-none leading-none pointer-events-none">
                  0{index + 1}
                </div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  className="relative z-10"
                >
                  {/* Category & Date */}
                  <div className="overflow-hidden mb-6 text-primary">
                    <motion.div
                      variants={revealVariants}
                      className="flex items-center gap-4"
                    >
                      <span className="text-primary font-black text-sm tracking-[0.2em] uppercase">
                        {eventTypeMap[item.eventType] || item.eventType}
                      </span>
                      <Minus className="text-primary/20 w-8" />
                      <span className="text-primary/40 text-xs font-bold uppercase tracking-widest">
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(
                              "ar-EG",
                              { month: "long", year: "numeric" }
                            )
                          : "—"}
                      </span>
                    </motion.div>
                  </div>

                  {/* Headline with Mask Effect */}
                  <div className="overflow-hidden mb-10">
                    <motion.h1
                      variants={revealVariants}
                      className="text-4xl md:text-6xl lg:text-7xl font-black text-primary leading-[1.1]"
                    >
                      {item.title}
                    </motion.h1>
                  </div>

                  {/* Summary */}
                  <div className="overflow-hidden mb-12">
                    <motion.p
                      variants={revealVariants}
                      className="text-primary/40 text-lg md:text-xl max-w-md leading-relaxed font-medium"
                    >
                      {item.summary ||
                        "نصنع المستقبل من خلال الإبداع والتميز في كل مشروع نقدمه."}
                    </motion.p>
                  </div>

                  {/* Button */}
                  <div className="overflow-hidden">
                    <motion.div variants={revealVariants}>
                      <button
                        onClick={() => handleClick(item)}
                        className="group relative flex items-center gap-6 text-white"
                      >
                        <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                          {buttonLoading === item.id ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowLeft className="group-hover:-translate-x-2 transition-transform text-primary" />
                          )}
                        </div>
                        <span className="text-lg font-black tracking-widest uppercase text-primary transition-colors">
                          استكشف القصة
                        </span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* 🖼️ قسم الصورة (55% Width - Left Side) */}
              <div className="w-full lg:w-[55%] h-full relative overflow-hidden">
                <motion.div
                  initial={{
                    scale: 1.2,
                    filter: "grayscale(100%) brightness(0.5)",
                  }}
                  animate={{
                    scale: 1,
                    filter: "grayscale(0%) brightness(0.8)",
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority
                      quality={100}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ffffff]" />
                  )}
                  {/* تداخل ناعم جداً */}
                  <div className="absolute inset-y-0 right-0 w-48 bg-linear-to-r from-transparent to-[#ffffff] hidden lg:block" />
                  <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-[#ffffff] to-transparent lg:hidden" />
                </motion.div>
              </div>
            </div>

            {/* Navigation Handles */}
            <div className="absolute bottom-32 left-16 z-50 flex items-center gap-10">
              <div className="flex gap-4">
                <button className="hero-prev w-12 h-12 flex items-center justify-center text-white/30 hover:text-primary transition-colors">
                  <ChevronRight size={32} />
                </button>
                <button className="hero-next w-12 h-12 flex items-center justify-center text-white/30 hover:text-primary transition-colors">
                  <ChevronLeft size={32} />
                </button>
              </div>
              {/* Progress Line */}
              <div className="w-32 h-[2px] bg-white/10 relative overflow-hidden hidden md:block">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-primary origin-right"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullets {
          bottom: 10% !important;
          right: 24px !important;
          width: auto !important;
          left: auto !important;
          display: flex !important;
          gap: 8px !important;
        }
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.1 !important;
          width: 20px !important;
          height: 2px !important;
          border-radius: 0 !important;
          margin: 0 !important;
          transition: all 0.5s ease-in-out !important;
        }
        .swiper-pagination-bullet-active {
          opacity: 1 !important;
          width: 60px !important;
          background: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}
