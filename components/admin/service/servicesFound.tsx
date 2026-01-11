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
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {activeServices.slice(0, 3).map((service: any) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group bg-white hover:-translate-y-1"
          >
            <div>
              {/* Image/Icon Area */}
              <div className="w-full aspect-video bg-gray-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:bg-primary/5 transition-colors duration-300">
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
                    <span className="text-4xl font-bold text-gray-300">?</span>
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
        ))}
      </div>
    </div>
  );
}
