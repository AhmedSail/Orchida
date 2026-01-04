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
      {/* صورة الخلفية */}
      <div className="absolute inset-0 bg-gray-300" />

      {/* النصوص */}
      <div className="relative z-20 p-6 max-w-md">
        <div className="h-6 w-40 bg-gray-400 rounded mb-4" />
        <div className="h-4 w-60 bg-gray-400 rounded mb-2" />
        <div className="h-4 w-52 bg-gray-400 rounded mb-4" />
        <div className="h-8 w-24 bg-gray-400 rounded" />
      </div>

      {/* Dots */}
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
  const prevSlide = () =>
    setIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  const nextSlide = () =>
    setIndex((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  const goToSlide = (i: number) => setIndex(i);

  if (sliders.length === 0) {
    return <SliderSkeleton />;
  }

  return (
    <main className="relative h-[20vh] md:h-[90vh] overflow-hidden w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <Image
            src={sliders[index].imageUrl}
            alt={sliders[index].title}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-1/2 right-4 flex flex-col gap-4 z-30">
        {/* زر فوق */}
        <motion.button
          onClick={prevSlide}
          initial={{ y: -80, opacity: 0 }} // ✅ ييجي من فوق
          animate={{ y: 0, opacity: 1 }} // ✅ ينزل للنص
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 md:p-3 bg-white/50 text-black rounded-full hover:bg-white transition"
        >
          <ChevronUp size={isMobile ? 10 : 25} />
        </motion.button>

        {/* زر تحت */}
        <motion.button
          onClick={nextSlide}
          initial={{ y: 80, opacity: 0 }} // ✅ ييجي من تحت
          animate={{ y: 0, opacity: 1 }} // ✅ يطلع للنص
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.15, y: 3 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 md:p-3 bg-white/50 text-black rounded-full hover:bg-white transition"
        >
          <ChevronDown size={isMobile ? 10 : 25} />
        </motion.button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
              i === index ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </main>
  );
}
