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
}: {
  services: Service[];
  role?: string;
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
          onClick={() => router.push("/admin/services/add")}
        >
          إضافة خدمة جديدة
        </Button>
      </div>

      {/* ✅ جدول للديسكتوب فقط */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الأيقونة</TableHead>
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
                      {service.icon && ICON_MAP[service.icon] ? (
                        React.createElement(ICON_MAP[service.icon], {
                          className: "w-10 h-10 text-primary",
                        })
                      ) : (
                        <span className="text-primary font-bold text-xl">
                          ?
                        </span>
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
                          router.push(`/admin/services/edit/${service.id}`)
                        }
                      >
                        تعديل
                      </Button>
                      <Button variant="destructive" size="sm">
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
                  {service.icon && ICON_MAP[service.icon] ? (
                    React.createElement(ICON_MAP[service.icon], {
                      className: "w-8 h-8 text-primary",
                    })
                  ) : (
                    <span className="text-primary font-bold text-xl">?</span>
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
                      router.push(`/admin/services/edit/${service.id}`)
                    }
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
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
