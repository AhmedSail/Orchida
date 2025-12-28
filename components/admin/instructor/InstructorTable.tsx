"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Link } from "next-view-transitions";
import { Instructor } from "@/app/admin/[adminId]/instructor/page";

const InstructorTable = ({
  instructors,
  userId,
}: {
  instructors: Instructor[];
  userId: string;
}) => {
  const [data, setData] = useState(instructors);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف المدرب نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/instructors/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setData(data.filter((item) => item.id !== id));
          Swal.fire({
            icon: "success",
            title: "تم الحذف بنجاح ✅",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "فشل في الحذف ❌",
            text: "حاول مرة أخرى",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الاتصال",
          text: "تأكد من الشبكة أو السيرفر",
        });
      }
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">قائمة المدربين</h2>

      {/* ✅ Table للديسكتوب */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">التخصص</TableHead>
              <TableHead className="text-right">سنوات الخبرة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell className="text-right">{instructor.name}</TableCell>
                <TableCell className="text-right">{instructor.email}</TableCell>
                <TableCell className="text-right">{instructor.phone}</TableCell>
                <TableCell className="text-right">
                  {instructor.specialty}
                </TableCell>
                <TableCell className="text-right">
                  {instructor.experienceYears}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Cards للموبايل والآيباد */}
      <div className="grid gap-4 md:hidden">
        {data.map((instructor) => (
          <Card key={instructor.id}>
            <CardHeader>
              <CardTitle>{instructor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>البريد:</strong> {instructor.email}
              </p>
              <p>
                <strong>التخصص:</strong> {instructor.specialty}
              </p>
              <p>
                <strong>الخبرة:</strong> {instructor.experienceYears} سنوات
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstructorTable;
