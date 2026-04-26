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
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full  blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl" />

      <div className="container mx-auto py-20 px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>حلول ذكية لنجاحك</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-600">
              خدماتنا الرقمية
            </span>{" "}
            المتكاملة
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed mb-8"
          >
            نقدم لك مجموعة من الخدمات الرقمية الاحترافية المصممة خصيصاً لمساعدتك
            على بناء وجودك الرقمي بقوة، من التصميم الإبداعي إلى التسويق
            الاستراتيجي والبرمجة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Link href="/portfolio">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-bold bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10 gap-3 group"
              >
                <Palette className="size-5 group-hover:scale-110 transition-transform" />
                تصفح معرض أعمالنا الشامل
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeServices.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Glow effect behind card */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative h-full flex flex-col bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 z-10">
                  {/* Decorative background circle */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

                  <div className="relative">
                    {/* Image/Icon Area */}
                    <div className="w-full aspect-video bg-slate-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden border border-slate-100 transition-all duration-500 shadow-sm group-hover:shadow-md relative">
                      {service.icon ? (
                        service.icon.startsWith("http") ? (
                          <Image
                            src={service.icon}
                            alt={service.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized
                          />
                        ) : ICON_MAP[service.icon] ? (
                          React.createElement(ICON_MAP[service.icon], {
                            className:
                              "w-16 h-16 text-primary group-hover:text-primary/80 transition-colors duration-500",
                          })
                        ) : (
                          <span className="text-4xl font-bold text-slate-300">
                            ?
                          </span>
                        )
                      ) : (
                        <span className="text-4xl font-bold text-slate-300">
                          ?
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">
                      {service.description || "لا يوجد وصف لهذه الخدمة حالياً."}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3 relative z-20">
                    {/* Navigation to Filtered Portfolio Page */}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary font-bold h-12 transition-all group-hover:border-primary/30"
                    >
                      <Link
                        href={`/portfolio?category=${(service as any).slug || service.name}`}
                      >
                        <Palette className="w-4 h-4 ml-2" />
                        تصفح أعمالنا
                      </Link>
                    </Button>

                    <Button
                      asChild
                      className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all bg-primary hover:bg-primary/90 text-white"
                    >
                      <Link href="/serviceRequest">اطلب الخدمة الآن</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
