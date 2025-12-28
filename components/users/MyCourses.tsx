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
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
      setLoadingId(id); // تعطيل الأزرار لهذا الصف
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

      await Swal.fire(
        "تم الإلغاء",
        data.message || "تم حذف التسجيل بنجاح",
        "success"
      );
    } catch (error: any) {
      // في حال الفشل، أعد تحميل البيانات من السيرفر أو أخبر المستخدم
      await Swal.fire("خطأ", error.message || "فشل إلغاء التسجيل", "error");
    } finally {
      setLoadingId(null);
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
      setLoadingId(id);
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
      setLoadingId(null);
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
            const disabled = loadingId === course.enrollmentId;
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(course.enrollmentId)}
                    disabled={disabled}
                  >
                    إلغاء التسجيل
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/${userId}/myCourses/${course.enrollmentId}/payment`
                      )
                    }
                    disabled={disabled}
                  >
                    دفع الرسوم
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
