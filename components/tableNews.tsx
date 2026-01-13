"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { InferSelectModel } from "drizzle-orm";
import { news } from "@/src/db/schema";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { deleteFromR2 } from "@/lib/r2-client";

export type News = InferSelectModel<typeof news>;

const TableNews = ({ news, userId }: { news: News[]; userId: string }) => {
  const router = useRouter();

  const sortedNews = [...news].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const paginatedNews = sortedNews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const eventTypeMap: Record<string, string> = {
    news: "خبر",
    announcement: "إعلان",
    article: "مقال",
    event: "فعالية",
    update: "تحديث",
    blog: "مدونة",
    pressRelease: "بيان صحفي",
    promotion: "عرض ترويجي",
    alert: "تنبيه",
  };

  const deleteNews = async (item: News) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا الخبر بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // ✅ إذا عنده صورة نحذفها من EdgeStore
        if (item.imageUrl) {
          await deleteFromR2(item.imageUrl);
        }

        // ✅ حذف الخبر من قاعدة البيانات
        const res = await fetch(`/api/news/${item.id}`, { method: "DELETE" });

        if (res.ok) {
          Swal.fire("تم الحذف ✅", "تم حذف الخبر بنجاح", "success");
          router.refresh();
        } else {
          Swal.fire("خطأ ❌", "فشل في حذف الخبر", "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      {/* ✅ جدول للشاشات الكبيرة */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="min-w-full text-center border">
          <TableCaption>آخر الأخبار والتحديثات</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] text-center">الصورة</TableHead>
              <TableHead className="text-center">العنوان</TableHead>
              <TableHead className="text-center">الملخص</TableHead>
              <TableHead className="text-center">نوع الحدث</TableHead>
              <TableHead className="text-center">تاريخ النشر</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedNews.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover mx-auto h-30 w-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md mx-auto" />
                  )}
                </TableCell>
                <TableCell className="font-semibold">{item.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.summary}
                </TableCell>
                <TableCell className="text-sm">
                  {eventTypeMap[item.eventType] || item.eventType}
                </TableCell>
                <TableCell className="text-sm">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                    : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  <span
                    className={
                      item.isActive ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.isActive ? "نشط ✅" : "غير نشط ❌"}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/${userId}/news/edit/${item.id}`)
                    }
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteNews(item)}
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
        {paginatedNews.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow flex flex-col gap-2"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={120}
                height={120}
                className="rounded-md object-cover mx-auto"
                unoptimized
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-md mx-auto" />
            )}
            <p>
              <strong>العنوان:</strong> {item.title}
            </p>
            <p>
              <strong>الملخص:</strong> {item.summary}
            </p>
            <p>
              <strong>نوع الحدث:</strong>{" "}
              {eventTypeMap[item.eventType] || item.eventType}
            </p>
            <p>
              <strong>تاريخ النشر:</strong>{" "}
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                : "—"}
            </p>
            <p>
              <strong>الحالة:</strong> {item.isActive ? "نشط ✅" : "غير نشط ❌"}
            </p>
            <div className="flex gap-2 justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/admin/${userId}/news/edit/${item.id}`)
                }
              >
                تعديل
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteNews(item)}
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
};

export default TableNews;
