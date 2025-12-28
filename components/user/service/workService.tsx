"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Services } from "@/components/admin/service/servicesPage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "next-view-transitions";
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
      <p className="text-gray-500 text-center">
        اختر خدمة لعرض الأعمال الخاصة بها
      </p>
    );
  }

  const filteredWorks = allWorks.filter((work) => work.serviceId === active);

  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col h-[400px] border rounded-lg shadow"
          >
            <div className="w-full h-[200px] bg-gray-300 rounded-t" />
            <div className="flex flex-col gap-4 p-4 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/2" />
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/3 mt-auto" />
              <div className="h-8 bg-gray-300 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredWorks.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-12">
        لا توجد أعمال لهذه الخدمة حالياً
      </p>
    );
  }

  const getServiceName = (id: string) => {
    const service = services.find((s) => s.id === id);
    return service ? service.name : id;
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredWorks.map((work) => (
          <Link href={`/workPage/${work.id}`}>
            <motion.div
              key={work.id}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="shadow hover:shadow-lg hover:shadow-primary/50 hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col rounded-lg overflow-hidden"
            >
              {/* صورة أو فيديو */}
              {work.imageUrl ? (
                work.type === "image" ? (
                  <Image
                    src={work.imageUrl ?? ""}
                    alt={work.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-[200px]"
                    unoptimized
                  />
                ) : (
                  <video
                    src={work.imageUrl ?? ""}
                    controls
                    className="w-full h-[200px] object-cover"
                  />
                )
              ) : (
                <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500">
                  لا يوجد صورة
                </div>
              )}

              {/* تفاصيل العمل */}
              <div className="flex flex-col gap-3 bg-primary/10 p-4 flex-1">
                <h3 className="text-lg font-semibold text-primary">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {work.description}
                </p>

                <p className="text-xs text-gray-500 mt-auto">
                  الخدمة:{" "}
                  <span className="text-primary">
                    {getServiceName(work.serviceId)}
                  </span>{" "}
                  | مدة العمل:{" "}
                  <span className="text-primary">{work.duration || "—"}</span>
                </p>

                <Button className="w-full mt-3" variant="default">
                  <Link href={`/workPage/${work.id}`}>عرض العمل</Link>
                </Button>
              </div>
            </motion.div>
          </Link>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WorkService;
