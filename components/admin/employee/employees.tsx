"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { employees } from "@/src/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Spinner } from "@/components/ui/spinner";
import Swal from "sweetalert2";

export type Employee = InferSelectModel<typeof employees>;

export default function EmployeesPage({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [loading, setLoading] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // عدد الموظفين في الصفحة الواحدة

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = employees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة بيانات هذا الموظف بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("فشل الحذف");
      }

      setEmployees((prev) => prev.filter((emp) => emp.id !== id));

      Swal.fire({
        title: "تم الحذف!",
        text: "تم حذف الموظف بنجاح.",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } catch (error) {
      Swal.fire({
        title: "خطأ!",
        text: "حدث خطأ أثناء الحذف. حاول مرة أخرى.",
        icon: "error",
        confirmButtonText: "حسناً",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex text-primary font-bold items-center justify-center">
        <Spinner />
        <p className="text-center text-gray-500">جاري تحميل الموظفين ...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl text-primary font-bold">
          قائمة الموظفون
        </h2>

        <Button
          variant="default"
          className="text-white font-bold w-full md:w-auto"
        >
          <Link href="/admin/employees/add">إضافة موظف جديد</Link>
        </Button>
      </div>

      {/* ✅ جدول للشاشات الكبيرة */}
      <div className="hidden lg:block overflow-x-auto mt-6">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">المجال</TableHead>
              <TableHead className="text-right">الإيميل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">تاريخ الإضافة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.specialty}</TableCell>
                <TableCell>{emp.email || "-"}</TableCell>
                <TableCell>{emp.phone || "-"}</TableCell>
                <TableCell>
                  {emp.createdAt
                    ? new Date(emp.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Link href={`/admin/employees/edit/${emp.id}`}>تعديل</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(emp.id)}
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ كاردز للموبايل */}
      <div className="grid grid-cols-1 gap-4 mt-6 lg:hidden">
        {currentEmployees.map((emp) => (
          <div
            key={emp.id}
            className="border rounded-lg p-4 shadow flex flex-col gap-2"
          >
            <p>
              <strong>الاسم:</strong> {emp.name}
            </p>
            <p>
              <strong>المجال:</strong> {emp.specialty}
            </p>
            <p>
              <strong>الإيميل:</strong> {emp.email || "-"}
            </p>
            <p>
              <strong>الهاتف:</strong> {emp.phone || "-"}
            </p>
            <p>
              <strong>تاريخ الإضافة:</strong>{" "}
              {emp.createdAt
                ? new Date(emp.createdAt).toLocaleDateString()
                : "-"}
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm">
                <Link href={`/admin/employees/edit/${emp.id}`}>تعديل</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(emp.id)}
              >
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          السابق
        </Button>
        <span className="px-2">
          صفحة {currentPage} من {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
