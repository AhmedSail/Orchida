"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
  Parallax,
} from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { NewsType } from "../view/home-view";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Minus,
  Sparkles,
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

// 🎬 Premium Reveal Animations
const revealVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.1,
    },
  }),
};

export default function LatestNewsUser({ news }: { news: NewsType[] }) {
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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
    .filter((item) => item.isActive && item.isSlider)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (!activeNews.length) return null;

  // Opposite color for pagination/elements based on active slide color
  // Default to gold if background is purple, and vice versa
  const currentBg =
    activeNews[activeIndex]?.bgColor?.toLowerCase() || "#6e5e9b";
  const inverseColor = currentBg === "#6e5e9b" ? "#e0b016" : "#6e5e9b";

  return (
    <div
      className="w-full h-screen relative overflow-hidden bg-[#16131d]"
      dir="rtl"
      style={{ "--pagination-color": inverseColor } as React.CSSProperties}
    >
      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination, Parallax]}
        effect="fade"
        speed={1200}
        parallax={true}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className}">0${index + 1}</span>`;
          },
        }}
        navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
        className="w-full h-full"
      >
        {activeNews.map((item, index) => {
          const slideColor =
            item.bgColor || (index % 2 === 0 ? "#6e5e9b" : "#e0b016");

          return (
            <SwiperSlide
              key={item.id}
              className="relative w-full h-full overflow-hidden"
            >
              {/* Dynamic Solid Background */}
              <div
                className="absolute inset-0 transition-colors duration-1000"
                style={{ backgroundColor: slideColor }}
              />

              <div className="flex flex-col lg:flex-row  w-full h-full">
                {/* 📝 Data Section (RTL: Right side on large screens due to lg:order-1) */}
                <div className="w-full lg:w-[60%] h-full flex flex-col justify-center items-center relative px-8 lg:px-24 z-20 order-2 lg:order-1 pt-20 lg:pt-0">
                  {/* Visual Background Element: Large Outlined Number */}
                  <div
                    data-swiper-parallax="-300"
                    className="absolute top-1/2 right-10 lg:right-20 -translate-y-1/2 text-[20rem] lg:text-[30rem] font-black leading-none pointer-events-none select-none opacity-[0.05] text-transparent stroke-1"
                    style={{ WebkitTextStroke: "2px white" }}
                  ></div>

                  <div className="relative z-10">
                    {/* Category & Date */}
                    <div className="overflow-hidden mb-8">
                      <motion.div
                        custom={0}
                        variants={revealVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="flex items-center gap-4 group"
                      >
                        <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                          <span className="text-white font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {eventTypeMap[item.eventType] || item.eventType}
                          </span>
                        </div>
                        <div className="w-12 h-px bg-white/20" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString(
                                "ar-EG",
                                { month: "long", year: "numeric" }
                              )
                            : "—"}
                        </span>
                      </motion.div>
                    </div>

                    {/* Headline */}
                    <div className="overflow-hidden mb-8 max-w-2xl">
                      <motion.h1
                        custom={1}
                        variants={revealVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-sm"
                      >
                        {item.title}
                      </motion.h1>
                    </div>

                    {/* Summary */}
                    <div className="overflow-hidden mb-12 max-w-lg">
                      <motion.p
                        custom={2}
                        variants={revealVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="text-white/90 text-lg md:text-xl leading-relaxed font-medium"
                      >
                        {item.summary ||
                          "نصنع المستقبل من خلال الإبداع والتميز في كل مشروع نقدمه."}
                      </motion.p>
                    </div>

                    {/* Button */}
                    <div className="overflow-hidden">
                      <motion.div
                        custom={3}
                        variants={revealVariants}
                        initial="hidden"
                        whileInView="visible"
                      >
                        <button
                          onClick={() => handleClick(item)}
                          className="group relative flex items-center gap-6"
                        >
                          <div className="relative w-16 h-16 rounded-full border border-white/30 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-white group-hover:scale-110">
                            {/* Button Hover Background */}
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />

                            {buttonLoading === item.id ? (
                              <div className="relative z-10 w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <ArrowLeft className="relative z-10 w-6 h-6 text-white group-hover:text-black group-hover:-translate-x-1 transition-all" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-[0.2em] uppercase text-white/60 mb-1">
                              التفاصيل الكاملة
                            </span>
                            <span className="text-lg font-black text-white hover:text-white transition-colors">
                              استكشف القصة
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* 🖼️ Image Section (LTL: Left side on large screens due to lg:order-2) */}
                <div className="w-full lg:w-[40%] relative overflow-hidden order-1 ">
                  <div
                    className="aspect-[2/8] w-full h-full relative"
                    data-swiper-parallax="20%"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-[2s] ease-out"
                        priority
                        quality={100}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: slideColor }}
                      />
                    )}

                    {/* Blending Overlays - Corrected directions for RTL seamless blend */}
                    {/* Desktop: Fade image's right edge into the solid text section on the right */}
                    <div
                      className="absolute inset-y-0 right-0 w-full hidden lg:block"
                      style={{
                        background: `linear-gradient(to right, transparent 70%, ${slideColor} 100%)`,
                      }}
                    />

                    {/* Mobile: Fade image's bottom edge into the text section below */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-full lg:hidden"
                      style={{
                        background: `linear-gradient(to bottom, transparent 40%, ${slideColor} 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Handles - Redesigned */}
              <div className="absolute bottom-12 lg:bottom-40 left-8 lg:left-24 z-50 flex items-center gap-12">
                <div className="flex gap-4">
                  <button className="hero-prev group w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-md bg-white/5">
                    <ChevronRight
                      size={24}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>
                  <button className="hero-next group w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-md bg-white/5">
                    <ChevronLeft
                      size={24}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>

                {/* Timeline Auto-play Progress */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                    التالي تلقائياً
                  </span>
                  <div className="w-40 h-[2px] bg-white/10 relative overflow-hidden hidden md:block rounded-full">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-white origin-right"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Modern Global Styles for Swiper Pagination */}
      <style jsx global>{`
        .swiper-pagination-bullets {
          bottom: auto !important;
          top: 10% !important;
          right: 40px !important;
          transform: translateY(-50%) !important;
          width: auto !important;
          left: auto !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 24px !important;
          z-index: 100 !important;
        }
        @media (max-width: 1024px) {
          .swiper-pagination-bullets {
            top: 20px !important;
            right: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-direction: row !important;
            justify-content: center !important;
            width: 100% !important;
          }
        }
        .swiper-pagination-bullet {
          background: transparent !important;
          color: var(--pagination-color, rgba(255, 255, 255, 0.2)) !important;
          font-weight: 900 !important;
          font-size: 14px !important;
          width: auto !important;
          height: auto !important;
          border-radius: 0 !important;
          margin: 0 !important;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          opacity: 0.4 !important;
          position: relative !important;
          padding-right: 20px !important;
          display: flex !important;
          align-items: center !important;
        }
        .swiper-pagination-bullet::before {
          content: "";
          position: absolute;
          right: 0;
          width: 8px;
          height: 1px;
          background: currentColor;
          transition: width 0.5s ease;
          font-size: 50px !important;
        }
        .swiper-pagination-bullet-active {
          color: var(--pagination-color) !important;
          font-size: 20px !important;
          padding-right: 40px !important;
          opacity: 1 !important;
          font-size: 50px !important;
        }
        .swiper-pagination-bullet-active::before {
          width: 30px !important;
          font-size: 50px !important;
        }
      `}</style>
    </div>
  );
}
