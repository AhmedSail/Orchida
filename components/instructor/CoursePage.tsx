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
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Activity,
  MessageSquare,
  Hash,
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
  { label: string; color: string; icon: any; glow: string }
> = {
  pending_approval: {
    label: "بانتظار الموافقة",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    glow: "shadow-amber-500/10",
    icon: Clock,
  },
  open: {
    label: "التسجيل مفتوح",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "قيد التنفيذ",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    glow: "shadow-blue-500/10",
    icon: LayoutDashboard,
  },
  completed: {
    label: "مكتملة",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    glow: "shadow-slate-500/10",
    icon: CheckCircle2,
  },
  closed: {
    label: "مغلقة",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    glow: "shadow-rose-500/10",
    icon: AlertCircle,
  },
  cancelled: {
    label: "ملغاة",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    glow: "shadow-red-500/10",
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
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto space-y-12" dir="rtl">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-[48px] bg-slate-900 p-10 md:p-16 text-white shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] opacity-70" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-primary tracking-[0.2em] font-black uppercase text-xs"
            >
              <div className="size-2 bg-primary rounded-full animate-ping" />
              <span>نظام إدارة التعلم الذكي | LMS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight"
            >
              مرحباً بك في <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-indigo-400 to-purple-400">
                مقرراتك الدراسية
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed"
            >
              منصة واحدة متكاملة لإدارة طلابك، تتبع الحضور والغياب، ومشاركة
              المحتوى التعليمي التفاعلي مع جميع الشعب الخاصة بك.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Target className="size-5 text-emerald-400" />
                <span className="text-sm font-bold">
                  {instructorSections.length} شعبة نشطة
                </span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Sparkles className="size-5 text-amber-400" />
                <span className="text-sm font-bold">بوابة المدرب</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:flex justify-end p-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
            <div className="relative size-64 rounded-[64px] bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 border-4 border-white/10 rotate-12 hover:rotate-0 transition-transform duration-700">
              <GraduationCap className="size-32 text-white/90 drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Left Stats/Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 px-2">
              <TrendingUp className="size-5 text-primary" />
              إحصائيات سريعة
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  label: "إجمالي الشعب",
                  value: instructorSections.length,
                  icon: Layers,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "دورات جارية",
                  value: instructorSections.filter(
                    (s) => s.courseStatus === "in_progress",
                  ).length,
                  icon: Activity,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "مشاركات جديدة",
                  value: "---",
                  icon: MessageSquare,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-6 rounded-[32px] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon className="size-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-linear-to-br from-indigo-600 to-primary text-white shadow-xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h4 className="text-xl font-black relative z-10 leading-tight">
              هل تحتاج إلى مساعدة <br /> في إدارة شعبك؟
            </h4>
            <p className="text-sm text-indigo-100 font-medium relative z-10 leading-relaxed">
              فريق الدعم الأكاديمي جاهز لمساعدتك في أي وقت لتنظيم محاضراتك.
            </p>
            <Button className="w-full h-12 rounded-2xl bg-white text-primary hover:bg-slate-100 font-black relative z-10 shadow-lg active:scale-95 transition-all">
              تواصل مع المنسق
            </Button>
          </div>
        </div>

        {/* Courses List */}
        <div className="xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              قائمة الشعب الدراسية
            </h2>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1.5 font-bold border-2 border-slate-100 text-slate-500"
            >
              {instructorSections.length} شعبة
            </Badge>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {instructorSections.map((section) => {
              const status = sectionStatuses[section.courseStatus] || {
                label: section.courseStatus,
                color: "bg-gray-100/10 text-gray-500",
                glow: "shadow-transparent",
                icon: AlertCircle,
              };
              const StatusIcon = status.icon;

              return (
                <motion.div key={section.sectionId} variants={item}>
                  <Link
                    href={`/instructor/${userId}/courses/${section.sectionId}/content`}
                    className="group flex flex-col relative h-full bg-white dark:bg-zinc-950 rounded-[44px] border-2 border-slate-100 dark:border-zinc-900 p-8 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:border-primary/40 hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Status UI */}
                    <div className="flex justify-between items-center mb-8">
                      <Badge
                        className={`${status.color} ${status.glow} border-2 shadow-lg px-5 py-2 rounded-full flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest`}
                      >
                        <StatusIcon className="size-3.5" />
                        {status.label}
                      </Badge>
                      <div className="size-12 rounded-[20px] bg-slate-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-[-5deg]">
                        <ChevronLeft className="size-6 transition-transform group-hover:-translate-x-1" />
                      </div>
                    </div>

                    <div className="space-y-6 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.2em]">
                          <Hash className="size-3" />
                          <span>الشعبة رقم {section.sectionNumber}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 group-hover:text-primary transition-colors leading-[1.3]">
                          {section.courseTitle}
                        </h2>
                      </div>

                      {/* Course Timeline Design */}
                      <div className="grid grid-cols-2 gap-4 p-5 rounded-[32px] bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            البداية
                          </span>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black text-xs">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            {section.startDate
                              ? new Date(section.startDate).toLocaleDateString(
                                  "ar-EG",
                                )
                              : "قريباً"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            النهاية
                          </span>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black text-xs">
                            <div className="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                            {section.endDate
                              ? new Date(section.endDate).toLocaleDateString(
                                  "ar-EG",
                                )
                              : "---"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-slate-50 dark:border-zinc-900 flex items-center justify-between">
                      <div className="flex -space-x-3 rtl:space-x-reverse">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="size-8 rounded-xl border-2 border-white dark:border-zinc-950 bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold"
                          >
                            {i === 3 ? "+" : ""}
                          </div>
                        ))}
                        <span className="mr-5 rtl:mr-0 ml-5 font-bold text-xs text-slate-400">
                          طلاب الشعبة
                        </span>
                      </div>
                      <div className="text-primary font-black text-sm flex items-center gap-2">
                        إدارة المحتوى
                        <ArrowRight className="size-4 scale-x-[-1]" />
                      </div>
                    </div>

                    {/* Aesthetic Background Shapes */}
                    <div className="absolute -bottom-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {instructorSections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-zinc-900/50 rounded-[64px] border-4 border-dashed border-slate-200 dark:border-zinc-800 text-center gap-8 px-10">
              <div className="size-32 rounded-[40px] bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-slate-200 animate-bounce">
                <BookOpen className="size-16" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                  لا توجد مقررات دراسية حالياً
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                  سيتم إدراج الدورات التدريبية المخصصة لك هنا بمجرد تعيينك من
                  قبل الإدارة.
                </p>
              </div>
              <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/20 transition-all active:scale-95 leading-none">
                تصفح الدليل الأكاديمي
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
