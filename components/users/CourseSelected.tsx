"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  BadgeDollarSign,
  Target,
  Users,
  BookOpen,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Courses } from "@/app/admin/[adminId]/courses/page";

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
    <div className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Image */}
            <div className="relative aspect-[16/6.6] w-full rounded-2xl overflow-hidden shadow-lg group">
              {coursesSelected.imageUrl ? (
                <Image
                  src={coursesSelected.imageUrl}
                  alt={coursesSelected.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <BookOpen size={64} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <h1 className="absolute bottom-6 right-6 text-2xl md:text-4xl font-bold text-white shadow-sm leading-tight">
                {coursesSelected.title}
              </h1>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-primary" />
                عن الدورة
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg text-justify">
                {coursesSelected.description || "لا يوجد وصف متاح."}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topics */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <CheckCircle2 className="text-primary" size={22} />
                  محاور الدورة
                </h3>
                <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {coursesSelected.topics || "غير محدد"}
                </div>
              </div>

              {/* Objectives */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Target className="text-primary" size={22} />
                  أهداف الدورة
                </h3>
                <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {coursesSelected.objectives || "غير محدد"}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Sticky Action Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-action border border-primary/10">
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <BadgeDollarSign className="text-green-600" size={20} />
                      </div>
                      سعر الدورة
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {coursesSelected.price
                        ? `${coursesSelected.price} $`
                        : "مجاني"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Clock className="text-blue-600" size={20} />
                      </div>
                      عدد الساعات
                    </div>
                    <span className="font-bold">
                      {coursesSelected.hours
                        ? `${coursesSelected.hours} ساعة`
                        : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <UserIcon className="text-purple-600" size={20} />
                      </div>
                      المدرب
                    </div>
                    <span className="font-bold truncate max-w-[150px]">
                      {lastInstructor?.name || "غير محدد"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Users className="text-orange-600" size={20} />
                      </div>
                      الفئة المستهدفة
                    </div>
                    <span className="font-bold truncate max-w-[150px]">
                      {coursesSelected.targetAudience || "الجميع"}
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ${
                    !isRegisterEnabled
                      ? "bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:scale-[1.02]"
                  }`}
                  disabled={registerLoading || !isRegisterEnabled}
                  onClick={() => {
                    if (!isRegisterEnabled) return;
                    setRegisterLoading(true);
                    router.push(`/courses/${coursesSelected.id}/register`);
                  }}
                >
                  {registerLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري التسجيل...
                    </div>
                  ) : isRegisterEnabled ? (
                    "سجّل الآن"
                  ) : (
                    "التسجيل مغلق"
                  )}
                </Button>

                {!isRegisterEnabled && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} />
                    نعتذر، التسجيل في هذه الدورة مغلق حالياً.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseSelected;
