"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Trash2,
  Calendar,
  BookOpen,
  Hash,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

type MyCourse = {
  enrollmentId: string;
  courseName: string;
  sectionNumber: number;
  enrolledAt: Date;
  status: string;
  price: string | null;
  paymentStatus: string | null;
};

const MyCourses = ({
  myCourses,
  userId,
}: {
  myCourses: MyCourse[];
  userId: string | null;
}) => {
  const [rows, setRows] = useState<MyCourse[]>(myCourses);
  const [loadingCancelId, setLoadingCancelId] = useState<string | null>(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState<string | null>(null);

  const router = useRouter();

  const handleCancel = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم إلغاء تسجيلك في هذه الدورة ولن تتمكن من التراجع",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، إلغاء التسجيل",
      cancelButtonText: "تراجع",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setLoadingCancelId(id);

      const res = await fetch(`/api/course-enrollments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "فشل إلغاء التسجيل");
      }

      setRows((prev) => prev.filter((r) => r.enrollmentId !== id));

      await Swal.fire({
        title: "تم الإلغاء",
        text: "تم إلغاء تسجيلك في الدورة بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } catch (error: any) {
      await Swal.fire("خطأ", error.message || "فشل إلغاء التسجيل", "error");
    } finally {
      setLoadingCancelId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex items-center gap-1 w-fit">
            <CheckCircle2 className="size-3" />
            نشط
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center gap-1 w-fit">
            <Clock className="size-3" />
            معلق
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none flex items-center gap-1 w-fit">
            <DollarSign className="size-3" />
            مدفوع
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none flex items-center gap-1 w-fit">
            <Clock className="size-3" />
            قيد الانتظار
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none flex items-center gap-1 w-fit">
            <AlertCircle className="size-3" />
            فشل الدفع
          </Badge>
        );
      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  return (
    <div className="p-6 container mx-auto min-h-screen mt-10" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <BookOpen className="size-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900">دوراتي المسجلة</h2>
          <p className="text-slate-500 text-sm">
            إدارة اشتراكاتك ومتابعة حالة الدفع
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-right py-5 px-6 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-slate-400" />
                  اسم الدورة
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Hash className="size-4 text-slate-400" />
                  رقم الشعبة
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  تاريخ التسجيل
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-slate-400" />
                  السعر
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                حالة الدفع
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                الحالة
              </TableHead>
              <TableHead className="text-center font-bold text-slate-700">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {rows.map((course) => (
                <motion.tr
                  key={course.enrollmentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
                >
                  <TableCell className="py-5 px-6 font-bold text-slate-800">
                    {course.courseName}
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {course.sectionNumber}#
                  </TableCell>
                  <TableCell className="text-slate-500 tabular-nums">
                    {new Date(course.enrolledAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-black text-primary">
                    {course.price ? `${course.price}$` : "—"}
                  </TableCell>
                  <TableCell>{getPaymentBadge(course.paymentStatus)}</TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      {/* زر دفع الرسوم - يظهر فقط إذا لم يتم الدفع */}
                      {course.paymentStatus !== "paid" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
                          onClick={() => {
                            setLoadingPaymentId(course.enrollmentId);
                            router.push(
                              `/${userId}/myCourses/${course.enrollmentId}/payment`
                            );
                          }}
                          disabled={loadingPaymentId === course.enrollmentId}
                        >
                          {loadingPaymentId === course.enrollmentId ? (
                            <Clock className="size-4 animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <CreditCard className="size-4" />
                              دفع الرسوم
                            </div>
                          )}
                        </Button>
                      )}

                      {/* زر إلغاء التسجيل */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        onClick={() => handleCancel(course.enrollmentId)}
                        disabled={loadingCancelId === course.enrollmentId}
                        title="إلغاء التسجيل"
                      >
                        {loadingCancelId === course.enrollmentId ? (
                          <Clock className="size-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                      <BookOpen className="size-8" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      لا توجد دورات مسجل بها حالياً.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/courses")}
                      className="mt-2 rounded-full"
                    >
                      تصفح الدورات المتاحة
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyCourses;
