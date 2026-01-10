"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  Trophy,
  History,
  FileSpreadsheet,
  Settings2,
  User,
  Clock,
  Layout,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";

type Section = {
  id: string;
  number: number;
  instructorName: string;
  instructorSpecialty: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  currentEnrollment: number;
  status:
    | "pending_approval"
    | "open"
    | "in_progress"
    | "completed"
    | "closed"
    | "cancelled";
};

type Courses = {
  id: string;
  title: string;
  description: string;
  sections: Section[];
};

const statusStyles: Record<
  Section["status"],
  {
    label: string;
    icon: any;
    className: string;
  }
> = {
  open: {
    label: "مفتوحة للتسجيل",
    icon: CheckCircle2,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  pending_approval: {
    label: "بانتظار الموافقة",
    icon: Clock,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  in_progress: {
    label: "قيد التنفيذ",
    icon: History,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  completed: {
    label: "مكتملة",
    icon: Trophy,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  closed: {
    label: "مغلقة",
    icon: Lock,
    className:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  },
  cancelled: {
    label: "ملغاة",
    icon: XCircle,
    className:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

const SectionTable = ({
  course,
  role,
  userId,
}: {
  course: Courses;
  role: string;
  userId: string;
}) => {
  const [sections, setSections] = useState<Section[]>(course.sections);

  useEffect(() => {
    setSections(course.sections);
  }, [course]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الشعبة نهائياً مع كافة سجلاتها!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/courses/courseSections/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire({
            title: "تم الحذف!",
            text: "تمت إزالة الشعبة بنجاح.",
            icon: "success",
            confirmButtonColor: "#675795",
          });
          setSections((prev) => prev.filter((s) => s.id !== id));
        } else {
          Swal.fire("خطأ!", "فشل في حذف الشعبة.", "error");
        }
      } catch (error) {
        Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
      }
    }
  };

  const handleChangeStatus = async (id: string, currentStatus: string) => {
    let options: Record<string, string> = {};

    if (role === "admin" || role === "coordinator") {
      if (currentStatus === "pending_approval") {
        options = {
          open: "✅ موافقة (تفعيل التسجيل)",
          cancelled: "❌ إلغاء الشعبة",
        };
      } else {
        options = {
          open: "نشطة (مفتوحة)",
          in_progress: "قيد التنفيذ",
          completed: "مكتملة",
          closed: "مغلقة",
          cancelled: "ملغاة",
        };
      }
    }

    if (role === "coordinator" && currentStatus === "pending_approval") {
      Swal.fire(
        "تنبيه",
        "هذه الشعبة بانتظار الاعتماد من قِبل الإدارة.",
        "info"
      );
      return;
    }

    const { value: newStatus } = await Swal.fire({
      title: "تحديث حالة الشعبة",
      input: "select",
      inputOptions: options,
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: "تحديث",
      cancelButtonText: "رجوع",
      confirmButtonColor: "#675795",
    });

    if (newStatus) {
      try {
        const res = await fetch(`/api/courses/courseSections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          Swal.fire("تم التحديث!", "تم تغيير حالة الشعبة بنجاح.", "success");
          setSections((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: newStatus as Section["status"] } : s
            )
          );
        } else {
          Swal.fire("خطأ!", "لم نتمكن من تحديث الحالة.", "error");
        }
      } catch (error) {
        Swal.fire("خطأ!", "خطأ في الاتصال بالسيرفر.", "error");
      }
    }
  };

  return (
    <div className="space-y-6 mt-10" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Layout className="size-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">
            الشعب الدراسية
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            إدارة المجموعات والمواعيد الخاصة بـ {course.title}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/50">
              <TableHead className="px-6 py-4 font-bold text-slate-500">
                رقم الشعبة
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500">
                المدرب
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-center">
                الفترة الزمنية
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-center">
                الإشغال
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-center">
                الحالة
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-center">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {sections.length > 0 ? (
                sections.map((section, index) => {
                  const status = statusStyles[section.status];
                  const occupancyRate =
                    (section.currentEnrollment / section.maxCapacity) * 100;

                  return (
                    <motion.tr
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b border-slate-50 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-400">
                          #{section.number}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="size-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-white">
                              {section.instructorName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                              {section.instructorSpecialty}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-300">
                            <Calendar className="size-3.5 text-primary/60" />
                            <span>من {section.startDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            إلى {section.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1.5 font-black text-slate-700 dark:text-zinc-200">
                            <span
                              className={
                                occupancyRate >= 90
                                  ? "text-red-500"
                                  : "text-primary"
                              }
                            >
                              {section.currentEnrollment}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span>{section.maxCapacity}</span>
                          </div>
                          <div className="w-20 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                occupancyRate >= 90
                                  ? "bg-red-500"
                                  : occupancyRate >= 50
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              }`}
                              style={{
                                width: `${Math.min(occupancyRate, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 py-1 gap-1.5 font-bold border-2 ${status.className}`}
                        >
                          <status.icon className="size-3.5" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-800"
                            >
                              <MoreHorizontal className="size-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-2xl shadow-2xl border-slate-200 dark:border-zinc-800"
                          >
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                              إدارة الشعبة
                            </DropdownMenuLabel>

                            <Link
                              href={`/${role}/${userId}/courses/sections/${section.id}/edit`}
                            >
                              <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                <Edit className="size-4 text-blue-500" />
                                <span className="font-bold">
                                  تعديل البيانات
                                </span>
                              </DropdownMenuItem>
                            </Link>

                            {(role === "admin" ||
                              (role === "coordinator" &&
                                section.status !== "pending_approval")) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeStatus(section.id, section.status)
                                }
                                className="gap-2.5 rounded-xl py-2.5 cursor-pointer"
                              >
                                <Settings2 className="size-4 text-amber-500" />
                                <span className="font-bold">تغيير الحالة</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="my-1 opacity-50" />

                            <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                              الأكاديميا والطلاب
                            </DropdownMenuLabel>

                            <Link
                              href={`/${role}/${userId}/courses/sections/${section.id}/students`}
                            >
                              <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                <Users className="size-4 text-primary" />
                                <span className="font-bold">سجل المسجلين</span>
                              </DropdownMenuItem>
                            </Link>

                            {(section.status === "open" ||
                              section.status === "in_progress") && (
                              <Link
                                href={`/${role}/${userId}/courses/sections/${section.id}/celender`}
                              >
                                <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                  <Calendar className="size-4 text-emerald-500" />
                                  <span className="font-bold">
                                    جدولة المحاضرات
                                  </span>
                                </DropdownMenuItem>
                              </Link>
                            )}

                            <Link
                              href={`/${role}/${userId}/courses/sections/${section.id}/attendance`}
                            >
                              <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                <FileSpreadsheet className="size-4 text-purple-500" />
                                <span className="font-bold">
                                  كشف الحضور والغياب
                                </span>
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuSeparator className="my-1 opacity-50" />

                            <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                              المخرجات والنجاح
                            </DropdownMenuLabel>

                            <Link
                              href={`/${role}/${userId}/courses/sections/${section.id}/newStudentWork`}
                            >
                              <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                <Plus className="size-4 text-emerald-500" />
                                <span className="font-bold">
                                  إضافة قصة نجاح
                                </span>
                              </DropdownMenuItem>
                            </Link>

                            <Link
                              href={`/${role}/${userId}/courses/sections/${section.id}/allStudentsWork`}
                            >
                              <DropdownMenuItem className="gap-2.5 rounded-xl py-2.5 cursor-pointer">
                                <Eye className="size-4 text-slate-500" />
                                <span className="font-bold">
                                  عرض أعمال الطلاب
                                </span>
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuSeparator className="my-1 opacity-50" />

                            <DropdownMenuItem
                              className="gap-2.5 rounded-xl py-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => handleDelete(section.id)}
                            >
                              <Trash2 className="size-4" />
                              <span className="font-bold">حذف الشعبة</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-bold">
                        لا يوجد شعب مضافة بعد
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default SectionTable;
