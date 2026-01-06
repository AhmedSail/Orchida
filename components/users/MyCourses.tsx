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
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

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
  // حالة محلية لإدارة الصفوف
  const [rows, setRows] = useState<MyCourse[]>(myCourses);
  const [loadingCancelId, setLoadingCancelId] = useState<string | null>(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState<string | null>(null);

  const router = useRouter();
  const handleCancel = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم إلغاء تسجيلك في هذه الدورة",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، إلغاء التسجيل",
      cancelButtonText: "تراجع",
    });

    if (!result.isConfirmed) return;

    try {
      setLoadingCancelId(id); // تعطيل الأزرار لهذا الصف
      // تحديث متفائل: احذف الصف محلياً مباشرةً
      setRows((prev) => prev.filter((r) => r.enrollmentId !== id));

      const res = await fetch(`/api/course-enrollments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        // تراجع عن التحديث المتفائل إذا فشل الطلب
        throw new Error(data?.message || "فشل إلغاء التسجيل");
      }

      await Swal.fire({
        title: "تم الإلغاء",
        text: "تم إلغاء تسجيلك في الدورة بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } catch (error: any) {
      // في حال الفشل، أعد تحميل البيانات من السيرفر أو أخبر المستخدم
      await Swal.fire("خطأ", error.message || "فشل إلغاء التسجيل", "error");
    } finally {
      setLoadingCancelId(null);
    }
  };

  const handlePayment = async (id: string) => {
    const result = await Swal.fire({
      title: "تأكيد الدفع",
      text: "هل تريد دفع رسوم هذه الدورة الآن؟",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "نعم، ادفع الآن",
      cancelButtonText: "تراجع",
    });

    if (!result.isConfirmed) return;

    try {
      setLoadingPaymentId(id);
      const res = await fetch(`/api/payments`, {
        method: "POST",
        body: JSON.stringify({ enrollmentId: id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "فشل عملية الدفع");

      // تحديث الحالة محلياً بعد الدفع (مثال: جعلها confirmed)
      setRows((prev) =>
        prev.map((r) =>
          r.enrollmentId === id ? { ...r, status: "confirmed" } : r
        )
      );

      await Swal.fire(
        "تم الدفع",
        data.message || "تمت عملية الدفع بنجاح",
        "success"
      );
    } catch (error: any) {
      await Swal.fire("خطأ", error.message || "فشل عملية الدفع", "error");
    } finally {
      setLoadingPaymentId(null);
    }
  };

  return (
    <div className="p-4 container mx-auto" dir="rtl">
      <h2 className="text-2xl text-primary font-bold mb-4">
        دوراتي المسجل فيها
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم الدورة</TableHead>
            <TableHead className="text-right">رقم الشعبة</TableHead>
            <TableHead className="text-right">تاريخ التسجيل</TableHead>
            <TableHead className="text-right">سعر الدورة</TableHead>
            <TableHead className="text-right">حالة الدفع</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((course) => {
            const disabledPayment = loadingPaymentId === course.enrollmentId;
            const disabledCancel = loadingCancelId === course.enrollmentId;
            return (
              <TableRow key={course.enrollmentId}>
                <TableCell className="font-medium">
                  {course.courseName}
                </TableCell>
                <TableCell className="font-medium">
                  {course.sectionNumber}
                </TableCell>
                <TableCell>
                  {new Date(course.enrolledAt).toLocaleDateString("ar-EG")}
                </TableCell>
                <TableCell className="font-medium">
                  {course.price ? `${course.price}$` : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {course.paymentStatus === "pending" && "قيد الانتظار"}
                  {course.paymentStatus === "paid" && "مدفوع"}
                  {course.paymentStatus === "failed" && "فشل الدفع"}
                  {course.paymentStatus === "refunded" && "مسترد"}
                </TableCell>
                <TableCell>
                  {course.status === "confirmed" ? "نشط" : "معلق"}
                </TableCell>
                <TableCell className="flex gap-2">
                  {/* زر إلغاء التسجيل */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(course.enrollmentId)}
                    disabled={disabledCancel}
                  >
                    {loadingCancelId === course.enrollmentId ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                          ></path>
                        </svg>
                        جاري الإلغاء...
                      </span>
                    ) : (
                      "إلغاء التسجيل"
                    )}
                  </Button>

                  {/* زر دفع الرسوم بنفس الأسلوب */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      router.push(
                        `/${userId}/myCourses/${course.enrollmentId}/payment`
                      );
                      setLoadingPaymentId(course.enrollmentId);
                    }}
                    disabled={disabledPayment}
                  >
                    {loadingPaymentId === course.enrollmentId ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                          ></path>
                        </svg>
                        جاري الدفع...
                      </span>
                    ) : (
                      "دفع الرسوم"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-sm text-muted-foreground"
              >
                لا توجد دورات مسجل بها حالياً.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MyCourses;
