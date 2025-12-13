"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Megaphone,
  Video,
  BrainCircuit,
  Code,
  Palette,
  Users,
  GraduationCap,
  BookOpen,
  PenLine,
} from "lucide-react";
import { Services } from "./servicesPage";

const ICON_MAP: Record<string, any> = {
  marketing: Megaphone,
  ai_videos: Video,
  ai: BrainCircuit,
  programming: Code,
  design: Palette,
  social_media: Users,
  graduation: GraduationCap,
  research: BookOpen,
  writing: PenLine,
};
function ServicesSkeleton() {
  return (
    <div className="p-6 container mx-auto" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-6 animate-pulse"
          >
            {/* دائرة الأيقونة */}
            <div className="w-16 h-16 rounded-full bg-gray-300 mb-4" />

            {/* العنوان */}
            <div className="h-4 w-32 bg-gray-300 rounded mb-3" />

            {/* الوصف */}
            <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesFound({ services }: { services: Services }) {
  const [loading, setLoading] = useState(false);

  // ✅ أنيميشن الكروت
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.6, ease: ["easeOut"] },
    }),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-primary gap-2">
        <ServicesSkeleton />
      </div>
    );
  }
  const activeServices = services.filter((s: any) => s.isActive);
  return (
    <div className="p-6 container mx-auto" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeServices.map((service: any, i: number) => (
          <motion.div
            key={service.id}
            className="group flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-6 transition duration-300 hover:shadow hover:bg-primary hover:shadow-primary hover:scale-105"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            custom={i}
          >
            {service.icon ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 transition duration-300 group-hover:bg-white">
                {service.icon && ICON_MAP[service.icon] ? (
                  React.createElement(ICON_MAP[service.icon], {
                    className:
                      "w-10 h-10 text-primary transition duration-300 group-hover:scale-110",
                  })
                ) : (
                  <span className="text-primary font-bold text-xl">?</span>
                )}
              </div>
            ) : (
              <span className="text-primary font-bold text-xl">?</span>
            )}

            {/* النص */}
            <h3 className="text-lg font-semibold text-gray-800 transition duration-300 group-hover:text-white">
              {service.name}
            </h3>

            {/* الوصف */}
            {service.description && (
              <p className="text-sm text-gray-500 mt-2 text-center transition duration-300 group-hover:text-white line-clamp-2">
                {service.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
