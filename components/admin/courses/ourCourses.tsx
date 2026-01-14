"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Layers,
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Users2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import Image from "next/image";
import CourseDrwaer from "./courseDrwaer";
import CourseDialog from "./courseDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CourseWithSections } from "@/app/coordinator/[coordinatorId]/courses/page";
import { deleteFromR2 } from "@/lib/r2-client";

interface Props {
  courses: CourseWithSections[];
  role: string;
  userId: string;
}

const OurCourses = ({ courses, role, userId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [allCourses, setAllCourses] = useState<CourseWithSections[]>([]);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseWithSections | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    setAllCourses(courses);
  }, [courses]);

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? course.isActive : !course.isActive);
    return matchesSearch && matchesStatus;
  });

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleView = (course: CourseWithSections) => {
    setSelectedCourse(course);
    setIsOpen(true);
  };

  const handleDelete = async (course: CourseWithSections) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف الدورة وجميع بياناتها المرتبطة!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      if (course.imageUrl) {
        await deleteFromR2(course.imageUrl);
      }
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");

      setAllCourses((prev) => prev.filter((c) => c.id !== course.id));

      Swal.fire({
        title: "تم الحذف!",
        text: "تمت إزالة الدورة بنجاح.",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } catch (error) {
      Swal.fire("خطأ!", "فشل حذف الدورة. حاول مرة أخرى.", "error");
    }
  };

  const canOpenNewSection = (course: CourseWithSections): boolean => {
    if (course.sections.length === 0) return true;
    const lastSection = course.sections[0]; // Assuming sorted newest first
    const activeStatuses = ["open", "pending_approval"];
    return !activeStatuses.includes(lastSection.status);
  };

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            إدارة الدورات التدريبية
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            شاهد، عدل، وقم بإدارة المحتوى التعليمي والأكاديمي للمركز
          </p>
        </div>
        {role === "admin" && (
          <Button
            onClick={() => {
              setLoading(true);
              window.location.href = `/admin/${userId}/courses/add`;
            }}
            disabled={loading}
            className="rounded-2xl h-12 px-6 gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? <Spinner /> : <Plus className="w-5 h-5" />}
            إضافة دورة جديدة
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            placeholder="بحث عن دورة..."
            className="pr-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-zinc-400 mr-2" />
          <select
            className="h-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none text-sm w-full md:w-48 appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="inactive">غير نشطة</option>
          </select>
        </div>
      </div>

      {/* Table Section (Desktop) */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
              <TableHead className="px-6 py-5 font-bold text-zinc-600">
                الدورة
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-zinc-600 text-center">
                التفاصيل
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-zinc-600 text-center">
                المهتمين
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-zinc-600 text-center">
                الحالة
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-zinc-600 text-center">
                إجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {currentCourses.length > 0 ? (
                currentCourses.map((course, index) => (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative size-16 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                          {course.imageUrl ? (
                            <Image
                              src={course.imageUrl}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="size-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <Layers className="w-6 h-6 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                            {course.title}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1">
                            {course.sections.length} شعب سابقة
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                          <Clock className="w-4 h-4 text-primary/70" />
                          {course.hours} ساعة
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-zinc-900">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          {course.price?.toString() || "0"}{" "}
                          {course.currency === "ILS"
                            ? "₪"
                            : course.currency === "USD"
                            ? "$"
                            : "JOD"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Link
                        href={`/admin/${userId}/leads?courseId=${course.id}`}
                      >
                        <div className="inline-flex flex-col items-center p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 hover:scale-105 transition-transform cursor-pointer">
                          <span className="text-lg font-black text-amber-600 block leading-none">
                            {course.leadsCount || 0}
                          </span>
                          <span className="text-[10px] text-amber-500 font-bold uppercase mt-1">
                            مهتم
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      {course.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full gap-1">
                          <CheckCircle2 className="w-3 h-3" /> نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 border-none px-3 py-1 rounded-full gap-1">
                          <XCircle className="w-3 h-3" /> معطل
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleView(course)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link
                          href={`/${role}/${userId}/courses/newSection/${course.id}`}
                        >
                          <Button
                            size="sm"
                            disabled={!canOpenNewSection(course)}
                            className="rounded-xl gap-2 font-bold px-4 bg-zinc-900 hover:bg-black text-white"
                          >
                            <Plus className="w-4 h-4" />
                            فتح شعبة
                          </Button>
                        </Link>
                        {role === "admin" && (
                          <div className="flex gap-1">
                            <Link
                              href={`/admin/${userId}/courses/edit/${course.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(course)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Layers className="w-12 h-12 text-zinc-200" />
                      <p className="text-zinc-500 font-medium">
                        لا توجد دورات مطابقة للبحث
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Grid Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:hidden">
        {currentCourses.map((course) => (
          <motion.div
            key={course.id}
            layout
            className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 w-full overflow-hidden">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="size-full bg-zinc-100 flex items-center justify-center">
                  <Layers className="w-12 h-12 text-zinc-300" />
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none shadow-sm rounded-xl py-1 px-3">
                  {course.hours} ساعة
                </Badge>
                <Badge className="bg-amber-100/90 backdrop-blur-md text-amber-700 border-none shadow-sm rounded-xl py-1 px-3">
                  {course.leadsCount || 0} مهتم
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                  {course.title}
                </h3>
                <div className="text-lg font-black text-primary">
                  {course.price?.toString()}{" "}
                  {course.currency === "ILS"
                    ? "₪"
                    : course.currency === "USD"
                    ? "$"
                    : "JOD"}
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 border-y border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    الحالة
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      course.isActive ? "text-emerald-600" : "text-zinc-500"
                    }`}
                  >
                    {course.isActive ? "دورة نشطة" : "دورة معطلة"}
                  </span>
                </div>
                <div className="flex-1 flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    الشعب
                  </span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {course.sections.length} شعبة
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleView(course)}
                  variant="outline"
                  className="rounded-2xl h-11 font-bold"
                >
                  التفاصيل
                </Button>
                <Link
                  href={`/${role}/${userId}/courses/newSection/${course.id}`}
                  className="w-full"
                >
                  <Button
                    disabled={!canOpenNewSection(course)}
                    className="w-full rounded-2xl h-11 font-bold bg-zinc-900 text-white"
                  >
                    فتح شعبة
                  </Button>
                </Link>
              </div>

              {role === "admin" && (
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/admin/${userId}/courses/edit/${course.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-blue-600 hover:bg-blue-50"
                    >
                      تعديل
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex-1 h-10 rounded-xl text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(course)}
                  >
                    حذف
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-xl h-10 px-4"
          >
            السابق
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={`size-10 p-0 rounded-xl font-bold transition-all ${
                  currentPage === i + 1
                    ? "shadow-md scale-110"
                    : "hover:bg-zinc-100"
                }`}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="rounded-xl h-10 px-4"
          >
            التالي
          </Button>
        </div>
      )}

      {/* View Detail Components */}
      {isMobile ? (
        <CourseDrwaer
          course={selectedCourse}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      ) : (
        <CourseDialog
          course={selectedCourse}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </div>
  );
};

export default OurCourses;
