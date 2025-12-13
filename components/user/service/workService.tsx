"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Works } from "@/components/admin/works/editWork";
import { Services } from "@/components/admin/service/servicesPage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export type WorkWithMedia = Works & {
  mainMedia?: { url: string; type: string } | null;
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

  // كل ما يتغير active نعمل skeleton
  useEffect(() => {
    if (active) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500); // ⏳ 5 ثواني
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active) {
    return <p className="text-gray-500">اختر خدمة لعرض الأعمال الخاصة بها</p>;
  }

  const filteredWorks = allWorks.filter((work) => work.serviceId === active);

  if (loading) {
    // Skeletons
    return (
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
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
      <p className="text-gray-500 col-span-3 text-center">
        لا توجد أعمال لهذه الخدمة حالياً
      </p>
    );
  }

  const getServiceName = (id: string) => {
    const service = services.find((s) => s.id === id);
    return service ? service.name : id;
  };

  // إعدادات الحركة للكروت
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <AnimatePresence>
        {filteredWorks.map((work) => (
          <motion.div
            key={work.id}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="shadow hover:shadow-lg hover:shadow-primary hover:scale-105 cursor-pointer hoverEffect flex flex-col h-[400px]"
          >
            {work.mainMedia ? (
              work.mainMedia.type === "image" ? (
                <Image
                  src={work.mainMedia.url}
                  alt={work.title}
                  width={300}
                  height={200}
                  className="object-cover rounded-t w-full h-[200px]"
                  unoptimized
                />
              ) : (
                <video
                  src={work.mainMedia.url}
                  controls
                  className="w-full h-[200px] rounded-t object-cover"
                />
              )
            ) : (
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-500 rounded-t">
                لا يوجد صورة
              </div>
            )}

            <div className="flex flex-col gap-2 bg-primary/10 p-4 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-500">عنوان العمل :</h3>
                <h3 className="text-lg font-semibold text-primary">
                  {work.title}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-start gap-2">
                  <h3 className="text-gray-500">الوصف :</h3>
                  <h3 className="text-lg font-semibold text-primary line-clamp-2">
                    {work.description}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-auto mb-5">
                  الخدمة:{" "}
                  <span className="text-primary">
                    {getServiceName(work.serviceId)}
                  </span>{" "}
                  | مدة العمل:{" "}
                  <span className="text-primary">{work.duration || "—"}</span>
                </p>
              </div>

              <Button className="w-full" variant={"default"}>
                <Link
                  href={{
                    pathname: `/workPage/${work.id}`,
                    query: {
                      title: work.title,
                      description: work.description,
                      duration: work.duration,
                    },
                  }}
                >
                  عرض العمل
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WorkService;
