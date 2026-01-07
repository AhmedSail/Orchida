"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Services } from "@/components/admin/service/servicesPage";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
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
import Image from "next/image";

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
};

export default function ServicePage({
  services,
  allWorks,
}: {
  services: Services;
  allWorks: WorkWithMedia[];
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-center py-10">جاري التحميل...</p>;
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen" dir="rtl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-primary sm:text-5xl mb-10 text-center"
      >
        خدماتنا الرقمية
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeServices.map((service) => {
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group bg-white hover:-translate-y-1"
            >
              <div>
                {/* Image/Icon Area */}
                <div className="w-full h-48 bg-gray-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:bg-primary/5 transition-colors duration-300">
                  {service.icon ? (
                    service.icon.startsWith("http") ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={service.icon}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                    ) : ICON_MAP[service.icon] ? (
                      React.createElement(ICON_MAP[service.icon], {
                        className:
                          "w-16 h-16 text-primary/80 group-hover:text-primary transition-colors duration-300",
                      })
                    ) : (
                      <span className="text-4xl font-bold text-gray-300">
                        ?
                      </span>
                    )
                  ) : (
                    <span className="text-4xl font-bold text-gray-300">?</span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                  {service.description || "لا يوجد وصف لهذه الخدمة حالياً."}
                </p>
              </div>

              <div className="mt-auto space-y-3">
                {/* Navigation to Separate Works Page */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary font-semibold"
                >
                  <Link href={`/services/${service.id}/works`}>
                    <BrainCircuit className="w-4 h-4 ml-2" />
                    تصفح معرض الأعمال
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                >
                  <Link href="/serviceRequest">اطلب الخدمة الآن</Link>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
