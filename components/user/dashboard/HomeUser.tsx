"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  GraduationCap,
  History,
  Wallet,
  Settings,
  Bell,
  Search,
  ChevronRight,
  Activity,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

interface Enrollment {
  enrollmentId: string;
  sectionId: string;
  courseTitle: string | null;
  sectionNumber: number | null;
}

interface Meeting {
  id: string;
  sectionId: string;
  courseTitle: string | null;
  sectionNumber: number | null;
  date: Date;
  startTime: string;
  endTime: string;
  location: string | null;
}

interface Props {
  userName: string;
  enrollments: Enrollment[];
  meetings: Meeting[];
}

const HomeUser = ({ userName, enrollments, meetings }: Props) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "meetings" | "payments" | "settings"
  >("overview");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const tabItems = [
    { id: "overview" as const, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "courses" as const, label: "كورساتي", icon: BookOpen },
    { id: "meetings" as const, label: "اللقاءات", icon: Calendar },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Cinematic Header */}
        <div className="relative overflow-hidden rounded-[48px] bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/50 to-transparent" />

          <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-6 text-center md:text-right">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest"
              >
                <Activity className="size-3" />
                <span>لوحة التحكم الشخصية</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  مرحباً بك، <span className="text-primary">{userName}</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium mt-4 max-w-lg">
                  أهلاً بك مجدداً في رحلتك التعليمية. إليك ملخص لنشاطاتك
                  الأكاديمية لهذا الأسبوع.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-8 bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10"
            >
              <div className="text-center">
                <span className="block text-4xl font-black text-white">
                  {enrollments.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  كورس مفعل
                </span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <span className="block text-4xl font-black text-white">
                  {meetings.length}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  لقاء قادم
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex flex-wrap gap-3 p-2 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800 shadow-sm">
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative px-8 py-4 rounded-3xl flex items-center gap-3 transition-all duration-300
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xl"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                  }
                `}
              >
                <item.icon
                  className={`size-5 ${isActive ? "text-primary" : ""}`}
                />
                <span className="font-bold text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-dashboard-tab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Grid */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {activeTab === "overview" && (
            <div className="space-y-10">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all"
                >
                  <div className="size-16 rounded-[24px] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                    <BookOpen className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      الدورات المسجلة
                    </p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                      {enrollments.length}
                    </h3>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all"
                >
                  <div className="size-16 rounded-[24px] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                    <Calendar className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      لقاءات الأسبوع
                    </p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                      {meetings.length}
                    </h3>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="hidden lg:flex bg-linear-to-br from-primary to-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-primary/20 items-center gap-6 text-white overflow-hidden relative group"
                >
                  <div className="absolute top-0 right-0 size-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150" />
                  <div className="size-16 rounded-[24px] bg-white/20 flex items-center justify-center">
                    <History className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/70 uppercase tracking-widest">
                      تاريخ البدء
                    </p>
                    <h3 className="text-xl font-bold">أنت معنا منذ عام 2024</h3>
                  </div>
                </motion.div>
              </div>

              {/* Courses Overview Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <GraduationCap className="size-7 text-primary" />
                    آخر تسجيلاتك
                  </h2>
                  <Button
                    variant="ghost"
                    className="font-bold text-slate-500 hover:text-primary transition-colors gap-2"
                    onClick={() => setActiveTab("courses")}
                  >
                    عرض الكل <ChevronRight className="size-4" />
                  </Button>
                </div>

                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.slice(0, 3).map((c, index) => (
                      <motion.div
                        key={c.enrollmentId}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-lg group"
                      >
                        <div className="relative h-48 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-indigo-500/20" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                            <BookOpen className="size-32" />
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="rounded-xl bg-white/90 dark:bg-zinc-950/90 text-slate-900 dark:text-white border-none shadow-xl font-black px-4 py-1.5 backdrop-blur-md">
                              شعبة {c.sectionNumber}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-8 space-y-6">
                          <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">
                            {c.courseTitle}
                          </h3>

                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Clock className="size-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                حالة النشاط
                              </p>
                              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                مستمر حالياً
                              </p>
                            </div>
                          </div>

                          <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-slate-100 text-white font-black text-lg shadow-xl shadow-black/5">
                            دخول المحتوى
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-center gap-6">
                    <div className="size-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300">
                      <BookOpen className="size-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        لا يوجد اشتراكات مفعلة
                      </h3>
                      <p className="text-slate-500 font-medium tracking-wide">
                        ابدأ رحلتك التعليمية وسجل في دوراتنا الآن
                      </p>
                    </div>
                    <Button className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 font-black">
                      استعرض الدورات
                    </Button>
                  </div>
                )}
              </div>

              {/* Upcoming Meetings Table Redesign */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Calendar className="size-7 text-amber-500" />
                    جدول اللقاءات القادم
                  </h2>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                  {meetings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                          <tr>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[11px]">
                              اسم الدورة
                            </th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[11px] text-center">
                              التاريخ
                            </th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[11px] text-center">
                              توقيت اللقاء
                            </th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[11px] text-center">
                              المكان الحضور
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                          {meetings.slice(0, 5).map((m, idx) => (
                            <motion.tr
                              key={m.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group hover:bg-slate-50/50 dark:hover:bg-zinc-950/50 transition-all cursor-default"
                            >
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                                    <BookOpen className="size-5" />
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                                      {m.courseTitle}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      المجموعة رقم {m.sectionNumber}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                                    {new Date(m.date).toLocaleDateString(
                                      "ar-EG",
                                      { month: "long", day: "numeric" }
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    {new Date(m.date).toLocaleDateString(
                                      "ar-EG",
                                      { weekday: "long" }
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <Badge className="rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none font-black px-4 py-1.5">
                                  {m.startTime} - {m.endTime}
                                </Badge>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                                  <MapPin className="size-4 text-red-400" />
                                  {m.location ?? "أونلاين"}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400 font-black">
                      لا يوجد لقاءات مجدولة قريباً
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-10">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                  حقيبتي التدريبية 🎒
                </h2>
                <Badge className="rounded-full px-5 py-2 bg-primary text-white font-black">
                  {enrollments.length} دورة
                </Badge>
              </div>

              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {enrollments.map((c, index) => (
                    <motion.div
                      key={c.enrollmentId}
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                      className="group bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all"
                    >
                      <div className="h-44 bg-slate-900 relative p-8 flex items-end">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-indigo-500/20" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                        <div className="absolute top-6 right-6">
                          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                            <BookOpen className="size-6" />
                          </div>
                        </div>
                        <Badge className="relative z-10 rounded-full bg-primary text-white border-2 border-slate-900 px-4 py-1.5 font-black text-xs uppercase">
                          مجموعة {c.sectionNumber}
                        </Badge>
                      </div>

                      <div className="p-10 space-y-8 text-right">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">
                          {c.courseTitle}
                        </h3>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 tracking-widest">
                            <span>التقدم الدراسي</span>
                            <span>0%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-primary group-hover:w-[15%] transition-all duration-1000" />
                          </div>
                        </div>

                        <Button className="w-full h-16 rounded-[28px] bg-slate-900 dark:bg-white dark:text-black hover:bg-black dark:hover:bg-slate-100 text-white font-black text-xl shadow-2xl shadow-primary/20">
                          فتح المحتوى
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-40 text-center opacity-50 font-black text-2xl">
                  لا تملك أي اشتراكات حالياً
                </div>
              )}
            </div>
          )}

          {activeTab === "meetings" && (
            <div className="space-y-10">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                  الأجندة الأكاديمية 🗓️
                </h2>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-400">
                    مباشر الأن
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-100 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                {meetings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                          <th className="px-10 py-8 font-black text-slate-400 text-xs uppercase tracking-widest">
                            تفاصيل اللقاء
                          </th>
                          <th className="px-10 py-8 font-black text-slate-400 text-xs uppercase tracking-widest text-center">
                            الموعد
                          </th>
                          <th className="px-10 py-8 font-black text-slate-400 text-xs uppercase tracking-widest text-center">
                            التوقيت
                          </th>
                          <th className="px-10 py-8 font-black text-slate-400 text-xs uppercase tracking-widest text-center">
                            طبيعة الحضور
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                        {meetings.map((m, idx) => (
                          <motion.tr
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-slate-50/50 dark:hover:bg-zinc-950/50 transition-all"
                          >
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                <div className="size-14 rounded-3xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 transition-all group-hover:bg-amber-100 group-hover:scale-110">
                                  <Calendar className="size-7" />
                                </div>
                                <div>
                                  <p className="text-xl font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                                    {m.courseTitle}
                                  </p>
                                  <p className="text-xs font-bold text-slate-400 tracking-wide mt-0.5">
                                    شعبة دراسية رقم {m.sectionNumber}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8 text-center font-bold text-slate-700 dark:text-slate-300">
                              {new Date(m.date).toLocaleDateString("ar-EG", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-10 py-8 text-center">
                              <Badge className="rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-200 border-none font-black px-6 py-2 text-sm shadow-sm group-hover:scale-110 transition-transform">
                                {m.startTime} - {m.endTime}
                              </Badge>
                            </td>
                            <td className="px-10 py-8 text-center">
                              <div className="flex items-center justify-center gap-2 font-black text-slate-500 group-hover:text-red-400 transition-colors">
                                <MapPin className="size-4" />
                                {m.location ?? "قاعة افتراضية"}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-30 grayscale">
                    <Calendar className="size-24" />
                    <p className="text-3xl font-black">القائمة فارغة تماماً</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomeUser;
