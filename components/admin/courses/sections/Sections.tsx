"use client";
import React, { useState, useMemo } from "react";
import SectionTable from "./SectionTable";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Layers, Library, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Section = {
  id: string;
  number: number;
  instructorId: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  instructorName: string;
  instructorEmail: string;
  instructorSpecialty: string;
  status:
    | "pending_approval"
    | "open"
    | "in_progress"
    | "completed"
    | "closed"
    | "cancelled";
  currentEnrollment: number;
  interestedCount: number;
  registeredCount: number;
  isHidden: boolean;
  isV2: boolean;
};

type Courses = {
  id: string;
  title: string;
  description: string;
  sections: Section[];
};

const Sections = ({
  courses,
  role,
  userId,
}: {
  courses: Courses[];
  role: string;
  userId: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const allSections = useMemo(() => {
    return courses.flatMap((course) =>
      course.sections.map((section) => ({
        ...section,
        courseTitle: course.title,
        courseId: course.id,
      })),
    );
  }, [courses]);

  const filteredSections = useMemo(() => {
    return allSections.filter((section) => {
      const matchSearch =
        section.instructorName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        section.number.toString().includes(searchTerm) ||
        section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCourse =
        courseFilter === "all" || section.courseId === courseFilter;
      const matchStatus =
        statusFilter === "all" || section.status === statusFilter;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [allSections, searchTerm, courseFilter, statusFilter]);

  return (
    <div className="space-y-10 pb-12" dir="rtl">
      {/* Header & Search & Filters */}
      <div className="flex flex-col gap-6 bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Library className="size-6" />
            <span className="text-sm font-black uppercase tracking-widest opacity-70">
              تنظيم المحتوى الأكاديمي
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
            إدارة الشعب الدراسية
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            تصفح وأدر جميع الشعب الدراسية لجميع الدورات في مكان واحد مع إمكانية
            الفلترة السريعة.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="ابحث برقم الشعبة، المدرب، أو الدورة..."
              className="pr-12 h-12 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm focus:ring-primary focus:border-primary transition-all px-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/3">
            <Select
              value={courseFilter}
              onValueChange={setCourseFilter}
              dir="rtl"
            >
              <SelectTrigger className="w-full h-12 bg-white dark:bg-zinc-950 rounded-xl border-slate-200 dark:border-zinc-800 font-bold text-slate-600">
                <SelectValue placeholder="فلترة حسب الدورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">
                  جميع الدورات
                </SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="font-bold">
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              dir="rtl"
            >
              <SelectTrigger className="w-full h-12 bg-white dark:bg-zinc-950 rounded-xl border-slate-200 dark:border-zinc-800 font-bold text-slate-600">
                <SelectValue placeholder="فلترة حسب حالة الشعبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">
                  جميع الحالات
                </SelectItem>
                <SelectItem value="open" className="font-bold text-emerald-600">
                  مفتوحة للتسجيل
                </SelectItem>
                <SelectItem
                  value="pending_approval"
                  className="font-bold text-amber-600"
                >
                  بانتظار الموافقة
                </SelectItem>
                <SelectItem
                  value="in_progress"
                  className="font-bold text-blue-600"
                >
                  قيد التنفيذ
                </SelectItem>
                <SelectItem
                  value="completed"
                  className="font-bold text-purple-600"
                >
                  مكتملة
                </SelectItem>
                <SelectItem value="closed" className="font-bold text-zinc-600">
                  مغلقة
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className="font-bold text-red-600"
                >
                  ملغاة
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="sections-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-8"
        >
          {filteredSections.length > 0 ? (
            <SectionTable
              sectionsList={filteredSections}
              role={role}
              userId={userId}
            />
          ) : (
            <div className="py-20 bg-slate-50/50 dark:bg-zinc-900/30 rounded-[40px] border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="size-24 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                  <Layers className="size-12" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  لا توجد نتائج
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm">
                  لم نجد أي شعب دراسية تطابق فلاتر البحث الحالية، يرجى تعديل
                  خيارات الفلترة.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Sections;
