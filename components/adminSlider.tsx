"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";

interface Slider {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminSlider() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/slider");
      const data = await res.json();
      setSliders(data);
    } catch (error) {
      console.error("خطأ في جلب السلايدرات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // ✅ دالة الحذف مع SweetAlert
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف السلايدر نهائياً ولا يمكن التراجع!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/slider/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "تم الحذف ✅",
            text: "تم حذف السلايدر بنجاح",
          });
          // تحديث القائمة بعد الحذف
          setSliders((prev) => prev.filter((s) => s.id !== id));
        } else {
          const errorData = await res.json();
          Swal.fire({
            icon: "error",
            title: "خطأ ❌",
            text: errorData.error || "فشل حذف السلايدر",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الاتصال",
          text: "تعذر الاتصال بالسيرفر",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">📸 إدارة السلايدر</h1>
        <Button
          variant="default"
          className="bg-primary text-white hover:bg-primary/80"
        >
          <Link href="/admin/slider/add">+ إضافة صورة جديدة</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-center">⏳ جاري تحميل السلايدرات...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">الصورة</TableHead>
              <TableHead className="text-center">العنوان</TableHead>
              <TableHead className="text-center">الوصف</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">ترتيب</TableHead>
              <TableHead className="text-center">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliders.map((slider) => (
              <TableRow key={slider.id}>
                <TableCell className="text-center">
                  <Image
                    src={slider.imageUrl}
                    alt={slider.title}
                    width={100}
                    height={60}
                    className="object-cover rounded-md mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {slider.title}
                </TableCell>
                <TableCell className="text-center">
                  {slider.description || "—"}
                </TableCell>
                <TableCell className="text-center">
                  {slider.isActive ? (
                    <span className="text-green-600 font-bold">مفعل ✅</span>
                  ) : (
                    <span className="text-red-600 font-bold">معطل ❌</span>
                  )}
                </TableCell>
                <TableCell className="text-center">{slider.order}</TableCell>
                <TableCell className="text-center">
                  {new Date(slider.createdAt).toLocaleDateString("ar-EG")}
                </TableCell>
                <TableCell className="text-center flex gap-2 items-center justify-center">
                  <Button
                    variant={"ghost"}
                    className="text-black border px-3 py-1 rounded-md hover:bg-primary/10 mr-2"
                  >
                    <Link href={`/admin/slider/edit/${slider.id}`}>تعديل</Link>
                  </Button>
                  <Button
                    onClick={() => handleDelete(slider.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
