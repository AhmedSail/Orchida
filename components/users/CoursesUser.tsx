"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Clock,
  BadgeDollarSign,
  BookOpen,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";

type UserCourse = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  hours: number | null;
  price: string | null;
  duration: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const CoursesUser = ({ allCourses }: { allCourses: UserCourse[] }) => {
  const router = useRouter();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);

  return (
    <div className="container mx-auto px-4 py-16" dir="rtl">
      {/* Header Section */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-bold tracking-wider text-sm bg-primary/10 px-4 py-2 rounded-full mb-4 inline-block">
            تعلم وتطور
          </span>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-1.5 h-10 bg-primary rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              دوراتنا <span className="text-primary">المتميزة</span>
            </h2>
          </motion.div>
          <p className="text-gray-500  mx-auto text-lg">
            اكتشف مجموعة واسعة من الدورات التدريبية المصممة لتعزيز مهاراتك
            والارتقاء بمسيرتك المهنية
          </p>
        </motion.div>
      </div>

      {/* Courses Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {allCourses.slice(0, 6).map((course) => (
          <motion.div
            key={course.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            variants={cardVariants}
            whileHover={{ y: -5 }}
          >
            {/* Image Section */}
            <div className="relative h-[400px] overflow-hidden">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-300" />
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60" />

              {/* Price Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-bold text-primary flex items-center gap-1.5 text-sm">
                <BadgeDollarSign size={16} />
                {course.price ? `${course.price} $` : "مجاني"}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col grow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                {course.description || "لا يوجد وصف متاح لهذه الدورة حالياً."}
              </p>

              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-primary/70" />
                    <span>
                      {course.hours ? `${course.hours} ساعة` : "غير محدد"}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={16} className="text-primary/70" />
                    <span>دورة شاملة</span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-xl bg-gray-900 text-white hover:bg-primary hover:text-white transition-all duration-300 h-12 text-base font-medium shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                  disabled={loadingCourseId === course.id}
                  onClick={() => {
                    setLoadingCourseId(course.id);
                    router.push(`/courses/${course.id}`);
                  }}
                >
                  {loadingCourseId === course.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      عرض التفاصيل
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={() => {
            setLoadingAll(true);
            router.push(`/courses`);
          }}
          disabled={loadingAll}
          variant="outline"
          className="px-8 h-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 text-lg group bg-transparent"
        >
          {loadingAll ? (
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              تصفح جميع الدورات
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default CoursesUser;
