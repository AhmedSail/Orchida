"use client";

import React, { useState } from "react";
import SectionContent from "./SectionContent";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  MessageSquare,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  UserCheck2,
  Phone,
  Mail,
  MoreVertical,
  Activity,
} from "lucide-react";
import { Badge } from "../ui/badge";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  sectionStatus?: string;
}

interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  confirmationStatus: string | null;
}

interface Props {
  user: string;
  userId: string;
  instructorSections: {
    sectionId: string;
    sectionNumber: number;
    startDate: Date | null;
    endDate: Date | null;
    courseTitle: string | null;
  }[];
  section: Section | null;
  allModules: AllModules[];
  courseId: string;
  chapters: AllChapters[];
  contents: AllContent[];
  role?: string;
  students: Student[];
}

const Clasification = ({
  user,
  section,
  allModules,
  userId,
  courseId,
  chapters,
  contents,
  role,
  students,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"content" | "members" | "forum">(
    "content"
  );
  const router = useRouter();

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold">لا يوجد بيانات لهذه الشعبة</h3>
      </div>
    );
  }

  const tabItems = [
    {
      id: "content" as const,
      label: "المحتوى التعليمي",
      icon: BookOpen,
      color: "text-blue-500",
      action: () => {
        setActiveTab("content");
        router.push(
          `/${
            role === "user" ? "dashboardUser" : role || "instructor"
          }/${userId}/courses/${section.id}/content`
        );
      },
    },
    {
      id: "members" as const,
      label: "الأعضاء والطلاب",
      icon: Users,
      color: "text-emerald-500",
      action: () => setActiveTab("members"),
    },
    {
      id: "forum" as const,
      label: "المنتدى والنقاش",
      icon: MessageSquare,
      color: "text-purple-500",
      action: () => {
        router.push(
          `/${
            role === "user" ? "dashboardUser" : role || "instructor"
          }/${userId}/courses/${section.id}/chat`
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header Section */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-[48px] bg-slate-900 border border-slate-800">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-50" />
        <div className="absolute -bottom-24 -left-24 size-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-primary tracking-widest font-black uppercase text-xs"
            >
              <Activity className="size-4" />
              <span>لوحة التحكم الأكاديمية</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight"
            >
              مرحباً <span className="text-primary">{user}</span>
              <br />
              <span className="text-slate-400 text-2xl md:text-3xl font-bold mt-2 block">
                {section.courseTitle}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
                <LayoutDashboard className="size-4 text-primary" />
                <span className="font-bold text-sm">
                  الشعبة {section.sectionNumber}
                </span>
              </div>
              {section.startDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
                  <Calendar className="size-4 text-emerald-500" />
                  <span className="font-bold text-sm">
                    تاريخ البدء:{" "}
                    {new Date(section.startDate).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl"
          >
            <div className="text-center">
              <span className="block text-3xl font-black text-white">
                {students.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                طالب مسجل
              </span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="text-center">
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black"
              >
                {section.sectionStatus === "open" ? "مفتوحة" : "قائمة"}
              </Badge>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                حالة الشعبة
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex flex-wrap gap-3 p-2 bg-slate-100 dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800">
        {tabItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`
                relative px-8 py-4 rounded-3xl flex items-center gap-3 transition-all duration-300
                ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 shadow-xl shadow-black/5"
                    : "hover:bg-white/50 dark:hover:bg-white/5"
                }
              `}
            >
              <item.icon
                className={`size-5 ${isActive ? item.color : "text-slate-400"}`}
              />
              <span
                className={`font-black text-sm ${
                  isActive ? "text-slate-800 dark:text-white" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[500px]"
      >
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <BookOpen className="size-6 text-primary" />
                المحتوى التعليمي
              </h2>
            </div>

            {["open", "in_progress", "closed"].includes(
              section.sectionStatus || ""
            ) ? (
              <div className="relative group">
                <SectionContent
                  modules={allModules}
                  sectionId={section.id}
                  userId={userId}
                  courseId={courseId}
                  chapters={chapters}
                  contents={contents}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 rounded-[40px] bg-amber-50 dark:bg-amber-950/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 text-center gap-6">
                <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
                  <AlertCircle className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-amber-800 dark:text-amber-200">
                    المحتوى غير متاح حالياً
                  </h3>
                  <p className="text-amber-600/70 font-medium">
                    هذا المحتوى متاح فقط للشعب المفتوحة أو التي قيد التنفيذ.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Users className="size-6 text-emerald-500" />
                قائمة الطلاب المسجلين
              </h2>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
                    <TableHead className="px-8 py-5 font-black text-slate-500">
                      الطالب
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500">
                      بيانات التواصل
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500 text-center">
                      حالة التسجيل
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500 text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((st, index) => (
                      <motion.tr
                        key={st.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border-b border-slate-50 dark:border-zinc-900"
                      >
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black">
                              {st.studentName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">
                              {st.studentName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Mail className="size-3 text-primary" />
                              {st.studentEmail}
                            </div>
                            {st.studentPhone && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Phone className="size-3 text-emerald-500" />
                                {st.studentPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Badge
                            className={`
                                rounded-full px-4 py-1 font-black border-2
                                ${
                                  st.confirmationStatus === "confirmed"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                }
                              `}
                          >
                            {st.confirmationStatus === "confirmed"
                              ? "مؤكد"
                              : "قيد المراجعة"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                          >
                            <MoreVertical className="size-5 text-slate-400" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="size-10 text-slate-200" />
                          <p className="font-bold text-slate-400 text-lg">
                            لا يوجد طلاب مسجلين حالياً
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "forum" && (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-xl text-center gap-8">
            <div className="size-24 rounded-[32px] bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 shadow-2xl shadow-purple-500/10">
              <MessageSquare className="size-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                المنتدى الطلابي التفاعلي
              </h2>
              <p className="text-slate-500 font-medium max-w-sm">
                هذا القسم مخصص للمناقشات الأكاديمية وتبادل الخبرات بين الطلاب
                والمدربين.
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(
                  `/${
                    role === "user" ? "dashboardUser" : role || "instructor"
                  }/${userId}/courses/${section.id}/chat`
                )
              }
              className="h-14 px-10 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-600/20 active:scale-95 transition-all"
            >
              دخول المنتدى الآن
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Clasification;
