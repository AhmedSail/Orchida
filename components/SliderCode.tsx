"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Slide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export default function Slider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  // ✅ جلب البيانات من الـ API
  useEffect(() => {
    const fetchSlides = async () => {
      const res = await fetch("/api/slider");
      const data = await res.json();
      // فلترة السلايدرات المفعلة فقط + ترتيبها
      const activeSlides = data
        .filter((s: Slide) => s.isActive)
        .sort((a: Slide, b: Slide) => a.order - b.order);
      setSlides(activeSlides);
    };
    fetchSlides();
  }, []);

  const prevSlide = () =>
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const goToSlide = (i: number) => setIndex(i);

  if (slides.length === 0) {
    return (
      <p className="text-center text-gray-500">لا يوجد سلايدرات حالياً ❌</p>
    );
  }

  return (
    <main className="relative h-screen sm:h-[80vh] md:h-screen overflow-hidden">
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
            src={slides[index].imageUrl}
            alt={slides[index].title}
            fill
            priority
            className="object-cover"
            unoptimized
          />
          <motion.div
            className="relative z-20 bg-linear-to-t from-gray-900/70 via-gray-800/60 to-transparent p-4 sm:p-6 rounded-lg max-w-full sm:max-w-md text-white shadow-lg m-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
              {slides[index].title}
            </h2>
            <p className="text-xs sm:text-sm mb-2 sm:mb-4">
              {slides[index].description}
            </p>
            <button className="px-3 py-2 sm:px-4 sm:py-2 border border-white rounded hover:bg-white hover:text-black transition text-xs sm:text-sm">
              Read More
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-1/2 right-4 flex flex-col gap-4 max-sm:hidden z-30">
        <button
          onClick={prevSlide}
          className="p-3 bg-white/50 text-black rounded-full hover:bg-white transition"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 bg-white/50 text-black rounded-full hover:bg-white transition"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
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
