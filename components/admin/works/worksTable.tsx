"use client";
import React, { useState, useMemo } from "react";
import { Work } from "./allWorkstable";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WorksTable = ({
  allWorks,
}: {
  allWorks: (Work & {
    mainMedia?: { url: string; type: string; publicId?: string } | null;
  })[];
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  const categories = Array.from(new Set(allWorks.map((w) => w.category)));

  const filteredWorks = useMemo(() => {
    return selectedCategory === "all"
      ? allWorks
      : allWorks.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, allWorks]);

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const paginatedWorks = filteredWorks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };

  const handleDelete = async (id: string, publicId?: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا العمل نهائياً مع صورته الرئيسية",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/work/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "تم الحذف ✅",
            text: "تم حذف العمل والصورة الرئيسية بنجاح",
          });
          router.refresh();
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ ❌",
            text: "حدث خطأ أثناء الحذف",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الاتصال",
          text: "تأكد من الاتصال بالخادم",
        });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow space-y-4">
      {/* فلترة */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="font-semibold">فلترة حسب الفئة:</span>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ✅ جدول للديسكتوب فقط */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow dir="rtl" className="text-right">
              <TableHead>الصورة الرئيسية</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>النطاق السعري</TableHead>
              <TableHead>المدة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>آخر تحديث</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWorks.length > 0 ? (
              paginatedWorks.map((work) => (
                <TableRow key={work.id} className="text-right">
                  <TableCell>
                    {work.mainMedia ? (
                      work.mainMedia.type === "image" ? (
                        <Image
                          src={work.mainMedia.url}
                          alt={work.title}
                          width={100}
                          height={60}
                          className="object-cover rounded"
                        />
                      ) : (
                        <video
                          src={work.mainMedia.url}
                          controls
                          className="w-[100px] h-[60px] rounded"
                        />
                      )
                    ) : (
                      <div className="w-[100px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        لا يوجد
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{work.title}</TableCell>
                  <TableCell>{work.description || "—"}</TableCell>
                  <TableCell>{work.category}</TableCell>
                  <TableCell>{work.priceRange || "—"}</TableCell>
                  <TableCell>{work.duration || "—"}</TableCell>
                  <TableCell>
                    {work.isActive ? (
                      <span className="text-green-600 font-semibold">نشط</span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        غير نشط
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {work.createdAt
                      ? new Date(work.createdAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {work.updatedAt
                      ? new Date(work.updatedAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/works/${work.id}/edit`)
                      }
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDelete(work.id, work.mainMedia?.publicId)
                      }
                    >
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500">
                  لا توجد أعمال مسجلة حالياً
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ كارد للموبايل والآيباد */}
      <div className="grid gap-4 lg:hidden">
        {paginatedWorks.length > 0 ? (
          paginatedWorks.map((work) => (
            <div
              key={work.id}
              className="border rounded-lg p-4 shadow flex flex-col gap-2"
            >
              {work.mainMedia ? (
                work.mainMedia.type === "image" ? (
                  <Image
                    src={work.mainMedia.url}
                    alt={work.title}
                    width={400}
                    height={200}
                    className="object-cover rounded"
                  />
                ) : (
                  <video
                    src={work.mainMedia.url}
                    controls
                    className="w-full h-[200px] rounded"
                  />
                )
              ) : (
                <div className="w-full h-[200px] bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">
                  لا يوجد صورة
                </div>
              )}

              <h3 className="font-bold text-lg">{work.title}</h3>
              <p className="text-gray-600">{work.description || "—"}</p>
              <p>
                <span className="font-semibold">الفئة:</span> {work.category}
              </p>
              <p>
                <span className="font-semibold">النطاق السعري:</span>{" "}
                {work.priceRange || "—"}
              </p>
              <p>
                <span className="font-semibold">المدة:</span>{" "}
                {work.duration || "—"}
              </p>
              <p>
                <span className="font-semibold">الحالة:</span>{" "}
                {work.isActive ? (
                  <span className="text-green-600 font-semibold">نشط</span>
                ) : (
                  <span className="text-red-600 font-semibold">غير نشط</span>
                )}
              </p>
              <p>
                <span className="font-semibold">تاريخ الإنشاء:</span>{" "}
                {work.createdAt
                  ? new Date(work.createdAt).toLocaleDateString("ar-EG")
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">آخر تحديث:</span>{" "}
                {work.updatedAt
                  ? new Date(work.updatedAt).toLocaleDateString("ar-EG")
                  : "—"}
              </p>

              {/* أزرار الإجراءات */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/works/${work.id}/edit`)}
                  className="w-full sm:w-auto"
                >
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleDelete(work.id, work.mainMedia?.publicId)
                  }
                  className="w-full sm:w-auto"
                >
                  حذف
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            لا توجد أعمال مسجلة حالياً
          </div>
        )}
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent className="flex flex-wrap justify-center gap-2">
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
      )}
    </div>
  );
};

export default WorksTable;
