"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Video,
  BrainCircuit,
  Code,
  Palette,
  Users,
  GraduationCap,
  BookOpen,
  PenLine,
} from "lucide-react";
import { InferSelectModel } from "drizzle-orm";
import { digitalServices } from "@/src/db/schema";
import Image from "next/image";
import { deleteFromR2 } from "@/lib/r2-client";
import Swal from "sweetalert2";

// ✅ Pagination UI من shadcn
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ICON_MAP: Record<string, any> = {
  marketing: Megaphone,
  ai_videos: Video,
  ai: BrainCircuit,
  programming: Code,
  design: Palette,
  social_media: Users,
  graduation: GraduationCap,
  research: BookOpen,
  writing: PenLine,
};

export type Service = InferSelectModel<typeof digitalServices>;
export type Services = Service[];

export default function ServicesPage({
  services,
  role,
  userId,
}: {
  services: Service[];
  role?: string;
  userId: string;
}) {
  const router = useRouter();

  // ✅ Skeleton Loading
  const [loading, setLoading] = useState(true);

  // ✅ Pagination
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const paginatedServices = services.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (service: Service) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف الخدمة وجميع ملفاتها نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        // 1. Delete images from R2 if they exist and are URLs
        if (service.smallImage && service.smallImage.startsWith("http")) {
          await deleteFromR2(service.smallImage);
        }
        if (service.largeImage && service.largeImage.startsWith("http")) {
          await deleteFromR2(service.largeImage);
        }

        // 2. Delete from DB
        const res = await fetch(`/api/services/${service.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete service");

        Swal.fire({
          icon: "success",
          title: "تم الحذف",
          text: "تم حذف الخدمة وجميع ملفاتها بنجاح",
          confirmButtonColor: "#2563eb",
        });

        router.refresh();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء الحذف",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // ✅ Skeleton Component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </TableCell>
      <TableCell className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      </TableCell>
    </TableRow>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-primary font-bold">قائمة الخدمات</h2>

        <Button
          className="text-white font-bold flex items-center gap-2"
          onClick={() => router.push(`/admin/${userId}/services/add`)}
        >
          إضافة خدمة جديدة
        </Button>
      </div>

      {/* ✅ جدول للديسكتوب فقط */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">صورة الخدمة</TableHead>
              <TableHead className="text-right">اسم الخدمة</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإضافة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              : paginatedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {/* ✅ Hybrid Render: Check Legacy Icon Map First, then Image URL */}
                      {service.icon && ICON_MAP[service.icon] ? (
                        React.createElement(ICON_MAP[service.icon], {
                          className: "w-10 h-10 text-primary",
                        })
                      ) : service.icon ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                          <Image
                            src={service.icon}
                            alt={service.name}
                            fill
                            className="object-cover"
                            unoptimized // Add unoptimized to handle external URLs nicely if domain config is missing
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 font-bold text-xl">
                            ?
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {service.description || "-"}
                    </TableCell>
                    <TableCell>
                      {service.isActive ? (
                        <span className="text-green-600 font-bold">نشط</span>
                      ) : (
                        <span className="text-red-600 font-bold">غير نشط</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.createdAt
                        ? new Date(service.createdAt).toLocaleDateString(
                            "ar-EG"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/${userId}/services/edit/${service.id}`
                          )
                        }
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service)}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ كارد للموبايل والآيباد */}
      <div className="grid grid-cols-1 gap-4 lg:hidden mt-6">
        {loading
          ? Array.from({ length: itemsPerPage }).map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 shadow bg-gray-100 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
                <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-20 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 w-16 bg-gray-300 rounded" />
                  <div className="h-8 w-16 bg-gray-300 rounded" />
                </div>
              </div>
            ))
          : paginatedServices.map((service) => (
              <div
                key={service.id}
                className="border rounded-lg p-4 shadow flex flex-col gap-2 bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {/* ✅ Mobile Hybrid Render */}
                  {service.icon && ICON_MAP[service.icon] ? (
                    React.createElement(ICON_MAP[service.icon], {
                      className: "w-8 h-8 text-primary",
                    })
                  ) : service.icon ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                      <Image
                        src={service.icon}
                        alt={service.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 font-bold text-xl">?</span>
                    </div>
                  )}
                  <h3 className="font-bold text-lg">{service.name}</h3>
                </div>
                <p className="text-gray-600">{service.description || "-"}</p>
                <p>
                  <strong>الحالة:</strong>{" "}
                  {service.isActive ? (
                    <span className="text-green-600 font-bold">نشط</span>
                  ) : (
                    <span className="text-red-600 font-bold">غير نشط</span>
                  )}
                </p>
                <p>
                  <strong>تاريخ الإضافة:</strong>{" "}
                  {service.createdAt
                    ? new Date(service.createdAt).toLocaleDateString("ar-EG")
                    : "-"}
                </p>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      router.push(
                        `/admin/${userId}/services/edit/${service.id}`
                      )
                    }
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleDelete(service)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
      </div>

      {/* ✅ Pagination */}
      {!loading && (
        <Pagination className="mt-6">
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
      )}
    </div>
  );
}
