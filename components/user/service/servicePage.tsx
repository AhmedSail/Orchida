"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
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
import { usePathname } from "next/navigation";
import { Services } from "@/components/admin/service/servicesPage";
import { Button } from "@/components/ui/button";
import WorkService from "./workService";
import { Works } from "@/components/admin/works/editWork";
import Link from "next/link";

const ICON_MAP: Record<string, React.ElementType> = {
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

// Variants for page-level animation
const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const ServiceSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white shadow-md rounded-xl p-6 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-4" />
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-3" />
          <div className="h-3 bg-gray-300 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const serviceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ServicePage({
  services,
  allWorks,
}: {
  services: Services;
  allWorks: Works[];
}) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);

  useEffect(() => {
    const activeServices = services.filter((s) => s.isActive);
    if (activeServices.length > 0) {
      setActiveService(activeServices[0].id);
    }
    setLoading(false);
  }, [services]);

  const handleClick = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4" dir="rtl">
        <div className="text-right mb-12">
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-4" />
          <div className="h-4 w-64 bg-gray-300 rounded animate-pulse" />
        </div>

        <ServiceSkeleton />
      </div>
    );
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <motion.div
      className="container mx-auto py-12 px-4"
      dir="rtl"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={titleVariants} className="text-right mb-12">
        <h1 className="text-4xl font-extrabold text-primary sm:text-5xl">
          خدمـــــــاتــــــــنــــــا الرقـــــــمــــيــــة
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          اختر الخدمة التي تناسبك وتعرف على أعمالنا
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {activeServices.map((service, i) => {
          const IconComponent = service.icon ? ICON_MAP[service.icon] : null;

          const isActive = activeService === service.id;

          return (
            <motion.div
              key={service.id}
              variants={serviceCardVariants}
              custom={i}
              onClick={() => setActiveService(service.id)}
              className={`group relative cursor-pointer rounded-xl p-6 text-center transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-2xl scale-105"
                  : "bg-white text-gray-800 shadow-lg hover:shadow-primary/40 hover:-translate-y-2"
              }`}
            >
              <div
                className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-300 ${
                  isActive ? "bg-white" : "bg-primary/10 group-hover:bg-white"
                }`}
              >
                {IconComponent ? (
                  <IconComponent
                    className={`w-8 h-8 transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-primary group-hover:text-primary group-hover:scale-110"
                    }`}
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">?</span>
                )}
              </div>

              <h3 className="text-lg font-bold">{service.name}</h3>
              <p
                className={`text-sm mt-2 line-clamp-2 transition-colors duration-300 ${
                  isActive
                    ? "text-gray-200"
                    : "text-gray-500 group-hover:text-primary"
                }`}
              >
                {service.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={buttonVariants}
        className="flex justify-center mb-16"
      >
        <Button
          asChild
          onClick={handleClick}
          disabled={isSubmitting}
          size="lg"
          className=" flex w-1/2 items-center justify-center gap-2 text-lg font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <Link href="/serviceRequest">اطلب الخدمة الآن</Link>
          )}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeService ?? "default"} // ✅ إصلاح الخطأ
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {activeService && (
            <WorkService
              active={activeService}
              allWorks={allWorks}
              services={services}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
