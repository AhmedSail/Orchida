"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SliderType } from "@/src/modules/home/ui/view/home-view";
import { useIsMobile } from "@/hooks/use-mobile";

function SliderSkeleton() {
  return (
    <main className="relative h-screen sm:h-[80vh] md:h-screen overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gray-300" />
      <div className="relative z-20 p-6 max-w-md">
        <div className="h-6 w-40 bg-gray-400 rounded mb-4" />
        <div className="h-4 w-60 bg-gray-400 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-400 rounded mb-4" />
        <div className="h-8 w-24 bg-gray-400 rounded" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full" />
        <div className="w-3 h-3 bg-gray-400 rounded-full" />
        <div className="w-3 h-3 bg-gray-400 rounded-full" />
      </div>
    </main>
  );
}

export default function Slider({ sliders }: { sliders: SliderType[] }) {
  const [index, setIndex] = useState(0);
  const isMobile = useIsMobile();

  // ✅ التدوير التلقائي (Autoplay)
  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
    }, 7000); // 7 ثواني لتناسب الحركة البطيئة
    return () => clearInterval(interval);
  }, [sliders.length]);

  const goToSlide = (i: number) => setIndex(i);

  if (sliders.length === 0) {
    return <SliderSkeleton />;
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* تأثير Ken Burns (تكبير تدريجي بطيء) */}
          <motion.div
            className="relative w-full h-full"
            initial={{ scale: 1.1, filter: "blur(10px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 7, ease: "linear" }}
          >
            <Image
              src={sliders[index].imageUrl}
              alt={sliders[index].title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={90}
            />
            {/* غطاء مظلم متدرج للتركيز على المحتوى */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
          </motion.div>

          {/* نصوص السلايدر في المنتصف */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
            <div className="max-w-4xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-4xl md:text-8xl font-black text-white drop-shadow-2xl mb-8 leading-tight"
              >
                {sliders[index].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="text-lg md:text-2xl text-white/80 font-medium drop-shadow-lg max-w-2xl mx-auto"
              >
                {sliders[index].description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* مؤشرات التنقل الجانبية الفريدة (Vertical Progress) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-30">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="group relative flex items-center justify-end gap-4"
          >
            <span
              className={`text-xs font-bold transition-all duration-500 ${
                i === index
                  ? "text-white scale-125"
                  : "text-white/20 group-hover:text-white/50"
              }`}
            >
              0{i + 1}
            </span>
            <div
              className={`h-[2px] transition-all duration-700 ${
                i === index
                  ? "w-16 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  : "w-4 bg-white/20 group-hover:w-8 group-hover:bg-white/40"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 opacity-50 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-linear-to-b from-white to-transparent" />
      </motion.div>
    </main>
  );
}
