"use client";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const [registerLoading, setRegisterLoading] = useState(false);
  const router = useRouter();
  return (
    <div className="p-6 mx-auto container" dir="rtl">
      <motion.h1
        className="lg:text-3xl text-xl text-center font-bold mb-6 md:text-right text-primary"
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
            className="md:h-vh w-full object-cover rounded-lg mb-6 shadow"
            width={20}
            height={20}
            unoptimized
          />
        )}

        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:justify-start items-center gap-4 justify-center text-2xl mb-10">
            <h1 className="font-bold">عنوان الدورة :</h1>
            <h1 className="text-primary font-bold">{coursesSelected.title}</h1>

            {/* زر التسجيل السريع بجانب العنوان */}
            <Button
              size="sm"
              variant="outline"
              className="flex border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 px-6"
              disabled={registerLoading || lastSection?.status === "closed"}
              onClick={() => {
                if (!isRegisterEnabled) return;
                setRegisterLoading(true);
                router.push(`/courses/${coursesSelected.id}/register`);
              }}
            >
              {registerLoading
                ? "جاري..."
                : isRegisterEnabled
                ? "سجل الآن"
                : "مغلق"}
            </Button>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed ">
            {coursesSelected.description}
          </p>

          <div className="p-4 border rounded-lg shadow-sm mt-5">
            <strong>👨‍🏫 المدرب:</strong>
            {lastInstructor?.name ?? "غير محدد"}
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5 whitespace-pre-wrap">
            <strong className="block"> محاور الدورة:</strong>{" "}
            {coursesSelected.topics ?? "غير محدد"}
          </div>
          <div className="p-4 border rounded-lg shadow-sm mt-5 whitespace-pre-wrap">
            <strong className="block"> اهداف الدورة:</strong>{" "}
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
            <Button
              className="w-full mt-5 flex items-center justify-center gap-2"
              disabled={registerLoading || lastSection?.status === "closed"}
              onClick={() => {
                if (!isRegisterEnabled) return; // 🚫 منع التنفيذ إذا الشعبة مغلقة
                setRegisterLoading(true);
                router.push(`/courses/${coursesSelected.id}/register`);
              }}
            >
              {registerLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  جاري التسجيل...
                </>
              ) : isRegisterEnabled ? (
                "سجل الآن في الشعبة الجديدة"
              ) : (
                "التسجيل غير متاح حالياً"
              )}
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
