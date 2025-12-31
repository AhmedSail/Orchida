"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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

// ✅ خريطة الحالات
const statusMap: Record<
  Section["status"],
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  open: { label: "نشطة", variant: "default" },
  pending_approval: { label: "بانتظار الموافقة", variant: "secondary" },
  in_progress: { label: "قيد التنفيذ", variant: "default" },
  completed: { label: "مكتملة", variant: "outline" },
  closed: { label: "مغلقة", variant: "secondary" },
  cancelled: { label: "ملغاة", variant: "destructive" },
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
      text: "سيتم حذف هذه الشعبة نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/courses/courseSections/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("تم الحذف!", "تم حذف الشعبة بنجاح.", "success");
          setSections((prev) => prev.filter((s) => s.id !== id));
        } else {
          Swal.fire("خطأ!", "فشل في حذف الشعبة.", "error");
        }
      } catch (error) {
        Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
      }
    }
  };

  // ✅ تغيير الحالة
  const handleChangeStatus = async (id: string, currentStatus: string) => {
    // خيارات الحالات حسب الدور
    let options: Record<string, string> = {};

    if (role === "admin") {
      if (currentStatus === "pending_approval") {
        // ✅ إذا بانتظار الموافقة → فقط خيارين
        options = {
          open: "✅ موافقة (نشطة)",
          cancelled: "❌ إلغاء",
        };
      } else {
        // باقي الحالات للأدمين
        options = {
          pending_approval: "بانتظار الموافقة",
          open: "نشطة",
          in_progress: "قيد التنفيذ",
          completed: "مكتملة",
          closed: "مغلقة",
          cancelled: "ملغاة",
        };
      }
    } else if (role === "coordinator") {
      if (currentStatus === "pending_approval") {
        // ✅ الكوردينيتور عند pending_approval → فقط خيارين
        options = {
          open: "✅ موافقة (نشطة)",
          cancelled: "❌ إلغاء",
        };
      } else {
        options = {
          open: "نشطة",
          in_progress: "قيد التنفيذ",
          completed: "مكتملة",
          closed: "مغلقة",
          cancelled: "ملغاة",
        };
      }
    } else if (role === "coordinator") {
      // الكوردينيتور
      if (currentStatus === "pending_approval") {
        // إذا الشعبة بانتظار الموافقة → لا يظهر خيار تغيير الحالة
        Swal.fire(
          "غير مسموح",
          "لا يمكنك تغيير الحالة قبل اعتمادها من الإدارة.",
          "info"
        );
        return;
      } else {
        // إذا الشعبة معتمدة أو أي حالة أخرى → يظهر له كل الحالات ما عدا "بانتظار الموافقة"
        options = {
          open: "نشطة",
          in_progress: "قيد التنفيذ",
          completed: "مكتملة",
          closed: "مغلقة",
          cancelled: "ملغاة",
        };
      }
    }

    const { value: newStatus } = await Swal.fire({
      title: "تغيير حالة الشعبة",
      input: "select",
      inputOptions: options,
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: "تحديث",
      cancelButtonText: "إلغاء",
    });

    if (newStatus) {
      try {
        const res = await fetch(`/api/courses/courseSections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          Swal.fire("تم التحديث!", "تم تغيير الحالة بنجاح.", "success");
          setSections((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: newStatus as Section["status"] } : s
            )
          );
        } else {
          Swal.fire("خطأ!", "فشل في تغيير الحالة.", "error");
        }
      } catch (error) {
        Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
      }
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">الشعب الخاصة بـ {course.title}</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الشعبة</TableHead>
            <TableHead className="text-right">المدرب</TableHead>
            <TableHead className="text-right">تاريخ البداية</TableHead>
            <TableHead className="text-right">تاريخ النهاية</TableHead>
            <TableHead className="text-right">السعة</TableHead>
            <TableHead className="text-right">المسجلين</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => {
            const statusInfo = statusMap[section.status] || {
              label: "غير معروفة",
              variant: "secondary",
            };

            return (
              <TableRow key={section.id}>
                <TableCell>{section.number}</TableCell>
                <TableCell>
                  {section.instructorName}
                  <br />
                  <span className="text-sm text-gray-500">
                    {section.instructorSpecialty}
                  </span>
                </TableCell>
                <TableCell>{section.startDate}</TableCell>
                <TableCell>{section.endDate}</TableCell>
                <TableCell>{section.maxCapacity}</TableCell>
                <TableCell>{section.currentEnrollment}</TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu dir="rtl">
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        خيارات
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Link
                        href={`/${role}/${userId}/courses/sections/${section.id}/edit`}
                      >
                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                      </Link>

                      {/* ✅ شرط ظهور تغيير الحالة */}
                      {role === "admin" ||
                      (role === "coordinator" &&
                        section.status !== "pending_approval") ? (
                        <DropdownMenuItem
                          onClick={() =>
                            handleChangeStatus(section.id, section.status)
                          }
                        >
                          تغيير الحالة
                        </DropdownMenuItem>
                      ) : null}

                      {/* ✅ شرط ظهور جدولة اللقاءات */}
                      {(section.status === "open" ||
                        section.status === "in_progress") && (
                        <Link
                          href={`/${role}/${userId}/courses/sections/${section.id}/celender`}
                        >
                          <DropdownMenuItem>جدولة اللقاءات</DropdownMenuItem>
                        </Link>
                      )}

                      {/* ✅ خيار عرض الطلاب المسجلين */}
                      <Link
                        href={`/${role}/${userId}/courses/sections/${section.id}/students`}
                      >
                        <DropdownMenuItem>عرض الطلاب المسجلين</DropdownMenuItem>
                      </Link>

                      <Link
                        href={`/${role}/${userId}/courses/sections/${section.id}/newStudentWork`}
                      >
                        <DropdownMenuItem>
                          اضافة قصة نجاح او عمل طلابي
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/${role}/${userId}/courses/sections/${section.id}/allStudentsWork`}
                      >
                        <DropdownMenuItem>
                          عرض قصص نجاح واعمال الطلاب
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/${role}/${userId}/courses/sections/${section.id}/attendance`}
                      >
                        <DropdownMenuItem>
                          اصدار كشف حضور و غياب للشعبة
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(section.id)}
                      >
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectionTable;
