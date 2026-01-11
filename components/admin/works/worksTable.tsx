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
import { useEdgeStore } from "@/lib/edgestore";
import {
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
  PlayCircle,
  ImageIcon,
} from "lucide-react";

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
  const itemsPerPage = 6;
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

  const handleUpdate = (id: string) => {
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
        const cleanUrl = (url: string) => url.trim().replace(/\s/g, "");

        if (fileUrl) {
          await edgestore.publicFiles.delete({
            url: cleanUrl(fileUrl),
          });
        }
        if (mediaFiles && mediaFiles.length > 0) {
          for (const file of mediaFiles) {
            if (file.url) {
              await edgestore.publicFiles.delete({
                url: cleanUrl(file.url),
              });
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
    <div className="space-y-6" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              إدارة الأعمال
            </h2>
            <p className="text-gray-500 text-sm">
              إجمالي الأعمال: {filteredWorks.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="text-gray-400" size={20} />
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-[220px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedWorks.length > 0 ? (
          paginatedWorks.map((work) => (
            <div
              key={work.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image Section */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {work.imageUrl ? (
                  work.type === "video" ? (
                    <div className="relative w-full h-full">
                      <video
                        src={work.imageUrl}
                        className="w-full h-full object-cover"
                        muted
                        controls
                        autoPlay
                      />
                    </div>
                  ) : (
                    <Image
                      src={work.imageUrl}
                      alt={work.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {work.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <CheckCircle size={12} />
                      نشط
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <XCircle size={12} />
                      غير نشط
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    <Tag size={12} />
                    {work.category}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {work.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {work.description || "لا يوجد وصف متاح"}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  {work.priceRange && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="truncate">{work.priceRange}</span>
                    </div>
                  )}
                  {work.duration && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={14} className="text-blue-600" />
                      <span className="truncate">{work.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 col-span-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>
                      {work.createdAt
                        ? new Date(work.createdAt).toLocaleDateString("ar-EG")
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => handleUpdate(work.id)}
                  >
                    <Edit size={14} />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() =>
                      handleDelete(
                        work.id,
                        work.imageUrl ?? "",
                        work.mediaFiles
                      )
                    }
                  >
                    <Trash2 size={14} />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد أعمال
              </h3>
              <p className="text-gray-500 text-sm">
                لم يتم العثور على أعمال في هذه الفئة
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <Pagination>
            <PaginationContent className="flex flex-wrap justify-center gap-2">
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(page - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={pageNum === page}
                      onClick={() => setPage(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(page + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default WorksTable;
