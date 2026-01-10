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
import Image from "next/image";
import { Link } from "next-view-transitions";
import Swal from "sweetalert2";
import { InferSelectModel } from "drizzle-orm";
import { sliders } from "@/src/db/schema";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEdgeStore } from "@/lib/edgestore";

export type Slider = InferSelectModel<typeof sliders>;

export default function AdminSlider({
  data,
  userId,
  role,
}: {
  data: Slider[];
  userId: string;
  role: string;
}) {
  const [sliders, setSliders] = useState<Slider[]>(data);
  const { edgestore } = useEdgeStore();
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(sliders.length / itemsPerPage);
  const paginatedSliders = sliders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDelete = async (slider: Slider) => {
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
        if (slider.imageUrl) {
          await edgestore.publicFiles.delete({
            url: slider.imageUrl,
          });
        }
        const res = await fetch(`/api/slider/${slider.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "تم الحذف ✅",
            text: "تم حذف السلايدر بنجاح",
          });
          setSliders((prev) => prev.filter((s) => s.id !== slider.id));
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
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary">📸 إدارة السلايدر</h1>
        <Button className="bg-primary text-white hover:bg-primary/80 w-full md:w-auto">
          <Link href={`/${role}/${userId}/slider/add`}>+ إضافة صورة جديدة</Link>
        </Button>
      </div>

      {/* ✅ جدول للشاشات الكبيرة */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="min-w-full text-center border">
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
            {paginatedSliders.map((slider) => (
              <TableRow key={slider.id}>
                <TableCell className="text-center">
                  <Image
                    src={slider.imageUrl}
                    alt={slider.title}
                    width={100}
                    height={60}
                    className="object-cover rounded-md mx-auto"
                    unoptimized
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
                <TableCell className="text-center flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    <Link href={`/${role}/${userId}/slider/edit/${slider.id}`}>
                      تعديل
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(slider)}
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
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {paginatedSliders.map((slider) => (
          <div
            key={slider.id}
            className="border rounded-lg p-4 shadow flex flex-col gap-2"
          >
            <Image
              src={slider.imageUrl}
              alt={slider.title}
              width={200}
              height={100}
              className="object-cover rounded-md mx-auto"
              unoptimized
            />
            <p>
              <strong>العنوان:</strong> {slider.title}
            </p>
            <p>
              <strong>الوصف:</strong> {slider.description || "—"}
            </p>
            <p>
              <strong>الحالة:</strong> {slider.isActive ? "مفعل ✅" : "معطل ❌"}
            </p>
            <p>
              <strong>الترتيب:</strong> {slider.order}
            </p>
            <p>
              <strong>تاريخ الإنشاء:</strong>{" "}
              {new Date(slider.createdAt).toLocaleDateString("ar-EG")}
            </p>
            <div className="flex gap-2 justify-center mt-2">
              <Button variant="outline" size="sm">
                <Link href={`/${role}/${userId}/slider/edit/${slider.id}`}>
                  تعديل
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(slider)}
              >
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ الباجينيشن */}
      <Pagination className="mt-6 flex justify-center">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(page - 1)} />
            </PaginationItem>
          )}
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => setPage(page + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
