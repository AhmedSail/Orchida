// 📍 src/components/instructor/CoursePage.tsx
"use client";

import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  GraduationCap,
  Clock,
  Layers,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";

interface CoursePageProps {
  instructorSections: {
    sectionId: string;
    sectionNumber: number;
    startDate: Date | null;
    endDate: Date | null;
    courseTitle: string | null;
    courseStatus: string;
  }[];
  userId: string;
}

const sectionStatuses: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending_approval: {
    label: "بانتظار الموافقة",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  open: {
    label: "التسجيل مفتوح",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "قيد التنفيذ",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: LayoutDashboard,
  },
  completed: {
    label: "مكتملة",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
  closed: {
    label: "مغلقة",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "ملغاة",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
};

const CoursePage = ({ instructorSections, userId }: CoursePageProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10" dir="rtl">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-primary/20 to-transparent opacity-50" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-primary tracking-widest font-black uppercase text-xs">
            <GraduationCap className="size-5" />
            <span>نظام إدارة التعلم</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            مرحباً بك في <span className="text-primary">مقرراتك الدراسية</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
            هنا يمكنك إدارة جميع الدورات التدريبية الموكلة إليك، تتبع الحضور،
            وإدارة المحتوى التعليمي لكل شعبة بسهولة.
          </p>
        </div>
        <div className="absolute -bottom-12 -left-12 size-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Stats Quick View (Summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="size-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              إجمالي الشعب
            </p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {instructorSections.length}
            </p>
          </div>
        </div>
        {/* Can add more stats here if needed */}
      </div>

      {/* Courses List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {instructorSections.map((section) => {
          const status = sectionStatuses[section.courseStatus] || {
            label: section.courseStatus,
            color: "bg-gray-100",
            icon: AlertCircle,
          };
          const StatusIcon = status.icon;

          return (
            <motion.div key={section.sectionId} variants={item}>
              <Link
                href={`/instructor/${userId}/courses/${section.sectionId}/content`}
                className="group block relative h-full bg-white dark:bg-zinc-950 rounded-[32px] border border-slate-100 dark:border-zinc-800 p-6 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-6">
                  <Badge
                    className={`${status.color} border shadow-none px-4 py-1.5 rounded-full flex items-center gap-2 font-bold`}
                  >
                    <StatusIcon className="size-3.5" />
                    {status.label}
                  </Badge>
                  <div className="size-10 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <ChevronLeft className="size-5" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 group-hover:text-primary transition-colors duration-300">
                    {section.courseTitle}
                  </h2>

                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <div className="size-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                      <LayoutDashboard className="size-4" />
                    </div>
                    <span>الشعبة رقم: {section.sectionNumber}</span>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-zinc-800">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">
                        تاريخ البدء
                      </span>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs">
                        <Calendar className="size-3.5 text-blue-500" />
                        {section.startDate
                          ? new Date(section.startDate).toLocaleDateString(
                              "ar-EG",
                            )
                          : "---"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">
                        تاريخ الانتهاء
                      </span>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs">
                        <Calendar className="size-3.5 text-rose-500" />
                        {section.endDate
                          ? new Date(section.endDate).toLocaleDateString(
                              "ar-EG",
                            )
                          : "---"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decoration */}
                <div className="absolute -bottom-4 -left-4 size-24 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {instructorSections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 text-center gap-6">
          <BookOpen className="size-20 text-slate-200" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800">
              لا توجد مقررات حالياً
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              بمجرد تعيين مقررات دراسية جديدة لك، ستظهر هنا تلقائياً.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
