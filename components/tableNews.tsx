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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Edit3,
  Trash2,
  Search,
  Plus,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  AlertCircle,
  Layout,
  Palette,
} from "lucide-react";

export type News = InferSelectModel<typeof news>;

const eventTypeMap: Record<string, string> = {
  news: "خبر عاجل",
  announcement: "إعلان هام",
  article: "مقال مميز",
  event: "فعالية قادمة",
  update: "تحديث جديد",
  blog: "مدونة",
  pressRelease: "بيان صحفي",
  promotion: "عرض خاص",
  alert: "تنبيه",
  competition: "مسابقة",
  workshop: "ورشة عمل",
  story: "قصة نجاح",
};

const TableNews = ({
  news,
  userId,
  role,
}: {
  news: News[];
  userId: string;
  role: string;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Sorting and Filtering
  const filteredNews = news
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const deleteNews = async (item: News) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا الخبر بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذف الخبر",
      cancelButtonText: "تراجع",
      background: "#fff",
      customClass: {
        title: "font-black text-xl",
        confirmButton: "rounded-full px-6",
        cancelButton: "rounded-full px-6",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (item.imageUrl) {
            await deleteFromR2(item.imageUrl);
          }
          const res = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
          if (res.ok) {
            Swal.fire({
              title: "تم الحذف!",
              text: "تمت إزالة الخبر من النظام بنجاح.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            router.refresh();
          } else {
            throw new Error("Failed to delete");
          }
        } catch (error) {
          Swal.fire("خطأ", "حدث خلل أثناء محاولة حذف الخبر", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث عن عنوان الخبر..."
            className="pr-10 rounded-xl border-gray-200 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
        <Button
          onClick={() => router.push(`/${role}/${userId}/news/newNews`)}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 gap-2"
        >
          <Plus className="w-4 h-4" />
          خبر جديد
        </Button>
      </div>

      {filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            لم يتم العثور على أي أخبار تطابق بحثك
          </p>
        </div>
      ) : (
        <>
          {/* ✅ Table for Desktop */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="text-right py-4 pr-6">الخبر</TableHead>
                  <TableHead className="text-center">نوع الحدث</TableHead>
                  <TableHead className="text-center">تاريخ النشر</TableHead>
                  <TableHead className="text-center">السلايدر</TableHead>
                  <TableHead className="text-center">اللون</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-left pl-6">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNews.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group hover:bg-gray-50/30 transition-colors"
                  >
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center gap-4 text-right">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Tag className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col max-w-[300px] md:max-w-md">
                          <span className="font-bold text-gray-800 line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">
                            {item.summary}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-none px-3"
                      >
                        {eventTypeMap[item.eventType] || item.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-600">
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString(
                                "ar-EG"
                              )
                            : "—"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isSlider ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100 gap-1.5 px-3">
                          <Layout className="w-3 h-3" />
                          نشط
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                          style={{ backgroundColor: item.bgColor || "#6e5e9b" }}
                        />
                        <span className="text-[10px] text-gray-500 font-mono">
                          {item.bgColor || "#6e5e9b"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1.5 px-3">
                          <Eye className="w-3 h-3" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-100 gap-1.5 px-3">
                          <EyeOff className="w-3 h-3" />
                          غير نشط
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors"
                          onClick={() =>
                            router.push(
                              `/${role}/${userId}/news/edit/${item.id}`
                            )
                          }
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-gray-400 transition-colors"
                          onClick={() => deleteNews(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ✅ Cards for Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden text-right">
            {paginatedNews.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <Tag className="w-8 h-8 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="w-fit mb-2 text-[10px] py-0 px-2"
                    >
                      {eventTypeMap[item.eventType] || item.eventType}
                    </Badge>
                    <h3 className="font-black text-gray-800 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50 text-right">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400">
                      تاريخ النشر
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">المظهر</span>
                    <div className="flex items-center gap-2">
                      {item.isSlider && (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-amber-100">
                          <Layout className="w-2.5 h-2.5" />
                          سلايدر
                        </div>
                      )}
                      <div
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.bgColor || "#6e5e9b" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">الحالة</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {item.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    className="flex-1 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border-none rounded-xl gap-2 font-bold"
                    onClick={() =>
                      router.push(`/${role}/${userId}/news/edit/${item.id}`)
                    }
                  >
                    <Edit3 className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl px-4"
                    onClick={() => deleteNews(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Improved Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination>
                <PaginationContent className="bg-white border border-gray-100 p-1 rounded-full shadow-sm">
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer hover:bg-purple-50 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          i + 1 === page
                            ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200"
                            : "hover:bg-purple-50 text-gray-500"
                        }`}
                        isActive={i + 1 === page}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer hover:bg-purple-50 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TableNews;
