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
import { motion, Variants } from "framer-motion";
import { NewsType } from "../view/home-view";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";

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

// ⚡ أنيميشن مخفف جداً للأداء المستقر
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
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
      className="w-full h-[85vh] md:h-screen relative bg-black overflow-hidden"
      dir="rtl"
    >
      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        effect="fade"
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
        className="w-full h-full"
      >
        {activeNews.map((item) => (
          <SwiperSlide key={item.id} className="relative w-full h-full">
            {/* الخلفية: حركة واحدة بسيطة عند الظهور (Ken Burns Light) */}
            <div className="absolute inset-0 z-0 bg-neutral-900">
              <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover blur-sm"
                    priority
                    sizes="100vw"
                    quality={80}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/10 text-6xl font-black italic">
                    ORCHIDA
                  </div>
                )}
                {/* استخدام Gradients بدلاً من Backdrop-blur الثقيل */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
              </motion.div>
            </div>

            {/* المحتوى */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end pb-32 md:pb-44 px-6 container mx-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-4xl text-right"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="bg-primary px-5 py-2 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                    {eventTypeMap[item.eventType] || item.eventType}
                  </span>
                  <div className="flex items-center gap-2 text-white/70 text-sm font-bold bg-black/30 px-4 py-2 rounded-full">
                    <Calendar size={14} className="text-primary" />
                    <span>
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(
                            "ar-EG",
                            { day: "numeric", month: "long" }
                          )
                        : "—"}
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 drop-shadow-2xl"
                >
                  {item.title}
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-white/80 text-lg md:text-xl max-w-3xl mb-10 leading-relaxed line-clamp-2 md:line-clamp-none"
                >
                  {item.summary ||
                    "نصنع المستقبل من خلال الإبداع والتميز في كل مشروع نقدمه."}
                </motion.p>

                <motion.div variants={itemVariants}>
                  <Button
                    onClick={() => handleClick(item)}
                    disabled={buttonLoading === item.id}
                    className="h-14 px-10 rounded-full bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 text-lg font-bold shadow-xl"
                  >
                    {buttonLoading === item.id ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center">
                        استكشف الخبر <ArrowLeft className="mr-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}

        {/* التحكم */}
        <div className="absolute bottom-20 left-12 z-30 hidden lg:flex gap-4">
          <button className="hero-prev w-14 h-14 rounded-full border border-white/20 bg-black/20 flex items-center justify-center text-white hover:bg-primary transition-all">
            <ChevronRight size={28} />
          </button>
          <button className="hero-next w-14 h-14 rounded-full border border-white/20 bg-black/20 flex items-center justify-center text-white hover:bg-primary transition-all">
            <ChevronLeft size={28} />
          </button>
        </div>
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.2 !important;
        }
        .swiper-pagination-bullet-active {
          background: #3b82f6 !important;
          opacity: 1 !important;
          width: 30px !important;
          border-radius: 10px !important;
          transition: width 0.3s !important;
        }
      `}</style>
    </div>
  );
}
