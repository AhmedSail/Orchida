"use client";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";

export type Instructor = {
  id: string | null;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
};

type Section = {
  id: string;
  number: number;
  instructor: Instructor;
  status:
    | "pending_approval"
    | "approved"
    | "open"
    | "in_progress"
    | "completed"
    | "closed"
    | "cancelled";
};

const CourseSelected = ({
  coursesSelected,
  lastInstructor,
  lastSection,
}: {
  coursesSelected: Courses;
  lastInstructor?: Instructor;
  lastSection?: Section;
}) => {
  const isRegisterEnabled =
    lastSection?.status === "open" || lastSection?.status === "in_progress";

  return (
    <div className="p-6 mx-auto container" dir="rtl">
      <motion.h1
        className="text-3xl font-bold mb-6 text-right text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        مرحبا بك في تفاصيل دورة {coursesSelected.title}
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 border p-6 rounded-xl gap-5 shadow-primary shadow-lg place-content-center items-center">
        {coursesSelected.imageUrl && (
          <Image
            src={coursesSelected.imageUrl}
            alt={coursesSelected.title}
            className="h-screen w-full object-cover rounded-lg mb-6 shadow"
            width={20}
            height={20}
            unoptimized
          />
        )}

        <div className="w-full">
          <div className="flex justify-start text-2xl mb-10">
            <h1>عنوان الدورة :</h1>
            <h1>{coursesSelected.title}</h1>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed ">
            {coursesSelected.description}
          </p>

          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong>👨‍🏫 المدرب:</strong>
            {lastInstructor?.name ?? "غير محدد"}
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong> محاور الدورة:</strong>{" "}
            {coursesSelected.topics ?? "غير محدد"}
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong> اهداف الدورة:</strong>{" "}
            {coursesSelected.objectives ?? "غير محدد"}
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong>⏳ عدد الساعات:</strong>{" "}
            {coursesSelected.hours ?? "غير محدد"} ساعة
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong> سعر الدورة:</strong> {coursesSelected.price ?? "غير محدد"}{" "}
            $
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong> الفئة المستهدفة:</strong>{" "}
            {coursesSelected.targetAudience ?? "غير محدد"}
          </div>

          {/* زر التسجيل */}
          <div className="flex flex-col justify-center items-center">
            <Button className="w-full mt-5" disabled={!isRegisterEnabled}>
              <Link href={`/courses/${coursesSelected.id}/register`}>
                سجل الان في الشعبة الجديدة
              </Link>
            </Button>

            {/* ✅ الرسالة إذا كانت الشعبة غير مفتوحة أو غير قيد التنفيذ */}
            {!isRegisterEnabled && (
              <p className="text-red-600 mt-3 font-semibold">
                🚫 الشعبة مغلقة، سيتم فتح شعبة جديدة لاحقاً
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelected;
