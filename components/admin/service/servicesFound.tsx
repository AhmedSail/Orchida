import React, { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
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
            <div className="w-16 h-16 rounded-full bg-gray-300 mb-4" />
            <div className="h-4 w-32 bg-gray-300 rounded mb-3" />
            <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesFound({ services }: { services: Services }) {
  const [loading] = useState(false);

  // ✅ أنيميشن الحاوية والكروت
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
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
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }} // ✅ الأنيميشن مرة واحدة فقط
      >
        {activeServices.map((service: any, i: number) => (
          <motion.div
            key={service.id}
            className="group flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-6 transition duration-300 hover:shadow hover:bg-primary hover:shadow-primary hover:scale-105"
            variants={cardVariants}
            viewport={{ once: true }}
          >
            {/* الصورة أو الأيقونة */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4 overflow-hidden transition duration-300 group-hover:bg-white border-2 border-transparent group-hover:border-white/50">
              {service.icon && ICON_MAP[service.icon] ? (
                React.createElement(ICON_MAP[service.icon], {
                  className:
                    "w-10 h-10 text-primary transition duration-300 group-hover:scale-110",
                })
              ) : service.icon ? (
                <Image
                  src={service.icon}
                  alt={service.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                  unoptimized // Ensures external images load correctly
                />
              ) : (
                <span className="text-primary font-bold text-xl">?</span>
              )}
            </div>

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
      </motion.div>
    </div>
  );
}
