"use client";
import React, { useState, useMemo } from "react";
import { Work, WorkWithMedia } from "./allWorkstable";
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
import { useEdgeStore } from "@/lib/edgestore";

const WorksTable = ({
  allWorks,
  userId,
}: {
  allWorks: WorkWithMedia[];
  userId: string | null;
}) => {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
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

  // ✅ دالة التعديل الجديدة
  const handleUpdate = (id: string) => {
    // يمكنك هنا توجيه المستخدم إلى صفحة التعديل
    // أو فتح نافذة منبثقة (modal) لتعديل البيانات
    router.push(`/admin/${userId}/works/${id}/media/edit`);
  };

  const handleDelete = async (
    id: string,
    fileUrl?: string,
    mediaFiles?: { url: string }[]
  ) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا العمل نهائياً مع وسائطه",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        if (fileUrl) {
          await edgestore.protectedFiles.delete({ url: fileUrl });
        }
        if (mediaFiles && mediaFiles.length > 0) {
          for (const file of mediaFiles) {
            if (file.url) {
              await edgestore.protectedFiles.delete({ url: file.url });
            }
          }
        }

        const res = await fetch(`/api/works/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "تم الحذف ✅",
            text: "تم حذف العمل والوسائط بنجاح",
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

      {/* جدول للديسكتوب */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow dir="rtl" className="text-right">
              <TableHead className="text-right">الصورة الرئيسية</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">النطاق السعري</TableHead>
              <TableHead className="text-right">المدة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">آخر تحديث</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWorks.length > 0 ? (
              paginatedWorks.map((work) => (
                <TableRow key={work.id} className="text-right">
                  <TableCell>
                    {work.imageUrl ? (
                      work.type === "image" ? (
                        <Image
                          src={work.imageUrl}
                          alt={work.title}
                          width={100}
                          height={60}
                          className="object-cover rounded"
                          unoptimized
                        />
                      ) : (
                        <video
                          src={work.imageUrl}
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
                  <TableCell className="max-w-[300px] whitespace-normal break-words">
                    {work.description || "—"}
                  </TableCell>
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
                    {/* ✅ زر التعديل الجديد */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdate(work.id)}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDelete(
                          work.id,
                          work.imageUrl ?? "",
                          work.mediaFiles
                        )
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

      {/* كارد للموبايل والآيباد */}
      <div className="grid gap-4 lg:hidden">
        {paginatedWorks.length > 0 ? (
          paginatedWorks.map((work) => (
            <div
              key={work.id}
              className="border rounded-lg p-4 shadow flex flex-col gap-2"
            >
              {work.imageUrl ? (
                work.type === "image" ? (
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    width={400}
                    height={200}
                    className="object-cover rounded"
                    unoptimized
                  />
                ) : (
                  <video
                    src={work.imageUrl}
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
                {/* ✅ زر التعديل الجديد */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdate(work.id)}
                >
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleDelete(work.id, work.imageUrl ?? "", work.mediaFiles)
                  }
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

      {/* Pagination */}
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
