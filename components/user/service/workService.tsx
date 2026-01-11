"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Services } from "@/components/admin/service/servicesPage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "next-view-transitions";
import { ArrowLeft, Clock, Eye, PlayCircle } from "lucide-react";

export type WorkWithMedia = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration: string | null;
  serviceId: string;
  projectUrl: string | null;
  priceRange: string | null;
  tags: string | null;
  toolsUsed: string | null;
  isActive: boolean;
  imageUrl: string | null;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  uploadDate: Date;
};

const WorkService = ({
  active,
  allWorks,
  services,
}: {
  active: string | null;
  allWorks: WorkWithMedia[];
  services: Services;
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active) {
    return (
      <p className="text-gray-500 text-center py-12">
        اختر خدمة لعرض الأعمال الخاصة بها
      </p>
    );
  }

  const filteredWorks = allWorks.filter((work) => work.serviceId === active);

  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-gray-100 animate-pulse h-[300px]"
          />
        ))}
      </div>
    );
  }

  if (filteredWorks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300 mt-8">
        <div className="relative w-20 h-20 mb-4 opacity-40">
          <Image
            src="/logo.png"
            alt="No content"
            fill
            className="object-contain grayscale"
          />
        </div>
        <p className="text-lg font-medium text-gray-600">
          لا توجد أعمال متاحة حالياً
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {filteredWorks.map((work) => (
          <motion.div
            key={work.id}
            variants={itemVariants}
            className="group relative h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20"
          >
            <Link href={`/workPage/${work.id}`} className="block w-full h-full">
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0 w-full h-full">
                {work.imageUrl ? (
                  work.type === "image" ? (
                    <Image
                      src={work.imageUrl ?? ""}
                      alt={work.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={work.imageUrl ?? ""}
                        className="w-full h-full object-cover"
                        muted // Auto-play often requires muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <PlayCircle className="w-12 h-12 text-white/80" />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    لا توجد صورة
                  </div>
                )}
                {/* Gradient Overlay - Darker at bottom */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10 transition-all duration-300">
                {/* Category Badge */}
                <div className="absolute top-6 right-6 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="bg-white/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs   text-white uppercase tracking-wider">
                    {work.category}
                  </span>
                </div>

                {/* Main Text Content */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-black mb-3 leading-tight drop-shadow-lg text-transparent bg-linear-to-r from-white to-gray-200 bg-clip-text">
                    {work.title}
                  </h3>

                  <p className="text-gray-200 text-sm line-clamp-2 mb-4 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 delay-75 leading-relaxed font-medium">
                    {work.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/20 pt-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{work.duration || "غير محدد"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs   text-white group-hover:text-black transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md group-hover:bg-white">
                      <span>عرض التفاصيل</span>
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkService;
