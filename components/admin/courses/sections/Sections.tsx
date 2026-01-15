"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SectionTable from "./SectionTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Layers,
  ChevronLeft,
  Info,
  Library,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";

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
  const [selectedCourse, setSelectedCourse] = useState<Courses | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-12" dir="rtl">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Library className="size-6" />
            <span className="text-sm font-black uppercase tracking-widest opacity-70">
              تنظيم المحتوى الأكاديمي
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">
            الدورات والشعب الدراسية
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            اختر الدورة التدريبية من القائمة أدناه لعرض الشعب النشطة وإدارة
            المجموعات والطلاب.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="ابحث عن دورة محددة..."
            className="pr-12 h-13 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm focus:ring-primary focus:border-primary transition-all px-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
              const isActive = selectedCourse?.id === course.id;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCourse(course)}
                  className="group cursor-pointer relative"
                >
                  <div
                    className={`
                      relative h-full p-6 rounded-[32px] border-2 transition-all duration-500
                      ${
                        isActive
                          ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                          : "bg-white dark:bg-zinc-950 border-slate-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1"
                      }
                    `}
                  >
                    <div className="flex flex-col h-full justify-between gap-6">
                      <div className="space-y-4">
                        <div
                          className={`
                          size-12 rounded-2xl flex items-center justify-center transition-colors
                          ${
                            isActive
                              ? "bg-white/20"
                              : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                          }
                        `}
                        >
                          <GraduationCap className="size-6" />
                        </div>
                        <h3
                          className={`text-lg font-black leading-tight ${
                            isActive
                              ? "text-white"
                              : "text-slate-800 dark:text-zinc-100"
                          }`}
                        >
                          {course.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-current/10">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider opacity-60`}
                          >
                            الشعب الحالية
                          </span>
                          <span className="text-xl font-black">
                            {course.sections.length}
                          </span>
                        </div>
                        <div
                          className={`
                          size-8 rounded-full flex items-center justify-center
                          ${
                            isActive
                              ? "bg-white text-primary"
                              : "bg-slate-50 dark:bg-zinc-800 text-slate-400 group-hover:bg-primary group-hover:text-white"
                          }
                          transition-all
                        `}
                        >
                          <ChevronLeft className="size-4" />
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute -top-1 -left-1 size-3 bg-white rounded-full border-2 border-primary"
                      />
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 bg-slate-50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center gap-4 text-center"
            >
              <div className="size-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                <Search className="size-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  لم نجد أي نتائج
                </h3>
                <p className="text-slate-500">
                  حاول البحث باستخدام كلمات أخرى أكثر دقة
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Course Sections Table */}
      <AnimatePresence mode="wait">
        {selectedCourse ? (
          <motion.div
            key={selectedCourse.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12"
          >
            {selectedCourse.sections.length > 0 ? (
              <SectionTable
                course={selectedCourse}
                role={role}
                userId={userId}
              />
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-10 rounded-[32px] text-center space-y-4">
                <div className="size-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <Info className="size-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-900 dark:text-amber-100">
                    لا توجد شعب حالياً
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 max-w-sm mx-auto">
                    هذه الدورة لا تحتوي على أي شعب دراسية مضافة حالياً. يمكنك
                    البدء بإضافة شعبة جديدة لهذه الدورة.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href={`/${role}/${userId}/courses/newSection/${selectedCourse.id}`}
                  >
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-12 px-8 font-bold">
                      فتح أول شعبة لهذه الدورة
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 py-32 bg-slate-50/50 dark:bg-zinc-900/30 rounded-[40px] border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-6"
          >
            <div className="relative">
              <div className="size-24 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 transition-transform hover:rotate-12 duration-500">
                <Layers className="size-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 bg-zinc-900 rounded-xl flex items-center justify-center text-white text-xs font-black">
                !
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                بانتظار اختيارك
              </h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                قم باختيار أحد الكروت بالأعلى لعرض تفاصيل الشعب والجداول
                الدراسية الخاصة بها هنا
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sections;
