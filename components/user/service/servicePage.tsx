"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Services } from "@/components/admin/service/servicesPage";

import { Button } from "@/components/ui/button";
import WorkService from "./workService";
import { Link } from "next-view-transitions";
import {
  BookOpen,
  BrainCircuit,
  Code,
  GraduationCap,
  Megaphone,
  Palette,
  PenLine,
  Users,
  Video,
} from "lucide-react";
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
  // ✅ الآن يقبل null كامل
};
export default function ServicePage({
  services,
  allWorks,
}: {
  services: Services;
  allWorks: WorkWithMedia[];
}) {
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);

  useEffect(() => {
    const activeServices = services.filter((s) => s.isActive);
    if (activeServices.length > 0) {
      setActiveService(activeServices[0].id);
    }
    setLoading(false);
  }, [services]);

  if (loading) {
    return <p className="text-center">جاري التحميل...</p>;
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <div className="container mx-auto py-12 px-4" dir="rtl">
      <h1 className="text-4xl font-extrabold text-primary sm:text-5xl mb-6">
        خدماتنا الرقمية
      </h1>

      {/* ✅ شبكة الخدمات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {activeServices.map((service) => {
          const isActive = activeService === service.id;
          return (
            <div
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`cursor-pointer rounded-xl p-6 text-center transition-all duration-300 ${
                isActive
                  ? "bg-white text-gray-800 shadow-2xl shadow-primary/50 scale-105"
                  : "bg-white text-gray-800 shadow-lg hover:-translate-y-2"
              }`}
            >
              {/* ✅ الأيقونة */}
              <div className="flex justify-center mb-4 group">
                {service.icon && ICON_MAP[service.icon] ? (
                  React.createElement(ICON_MAP[service.icon], {
                    className:
                      "w-10 h-10 text-primary transition-all duration-300 group-hover:scale-110",
                  })
                ) : (
                  <span className="text-2xl font-bold text-primary">?</span>
                )}
              </div>

              <h3 className="text-lg font-bold">{service.name}</h3>
              <p className="text-sm mt-2 line-clamp-2 text-gray-500">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ✅ تبويبات للوصف ومعرض الأعمال */}
      {activeService && (
        <>
          <Tabs defaultValue="description" dir="rtl">
            <TabsList className="flex flex-wrap gap-4 mb-6 justify-center">
              <TabsTrigger value="description">الوصف</TabsTrigger>
              <TabsTrigger value="works">معرض الأعمال</TabsTrigger>
            </TabsList>

            {/* تبويب الوصف */}
            <TabsContent value="description">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white rounded-xl shadow-2xl p-6 mb-12 w-full sm:w-11/12 md:w-3/4 lg:w-2/3 mx-auto"
              >
                <h2 className="text-2xl font-bold text-primary mb-4">
                  {services.find((s) => s.id === activeService)?.name ||
                    "الخدمة"}
                </h2>
                <p className="mt-2 text-gray-600 whitespace-pre-line">
                  {services.find((s) => s.id === activeService)?.description ||
                    ""}
                </p>
              </motion.div>
            </TabsContent>

            {/* تبويب معرض الأعمال */}
            <TabsContent value="works">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white rounded-xl shadow-xl p-6 mb-12 w-full sm:w-11/12 md:w-3/4 lg:w-2/3 mx-auto"
              >
                <h2 className="text-2xl font-bold text-primary mb-4">
                  معرض الأعمال الخاصة بالخدمة
                </h2>
                <WorkService
                  active={activeService}
                  allWorks={allWorks}
                  services={services}
                />
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* ✅ زر اطلب الخدمة خارج التبويبات */}
          <div className="flex justify-center mt-6">
            <Button
              asChild
              size="lg"
              className="flex w-full sm:w-2/3 md:w-1/2 lg:w-1/3 items-center justify-center gap-2 text-lg font-bold"
            >
              <Link href="/serviceRequest">اطلب الخدمة الآن</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
