"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { InferSelectModel } from "drizzle-orm";
import { serviceRequests } from "@/src/db/schema";
import Swal from "sweetalert2";

type Props = {
  data: ServiceRequest[];
  role?: string;
  userId: string;
};
export type ServiceRequest = InferSelectModel<typeof serviceRequests>;

const ServiceTable = ({ data, role, userId }: Props) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(data);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا الطلب بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/serviceRequset/attractor/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setRequests((prev) => prev.filter((req) => req.id !== id));
          Swal.fire({
            icon: "success",
            title: "تم الحذف ✅",
            text: "تم حذف الطلب بنجاح",
            confirmButtonColor: "#0f172a",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ ❌",
            text: "حدث خطأ أثناء الحذف",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الاتصال بالسيرفر ❌",
          text: "تأكد من الاتصال بالإنترنت وحاول مرة أخرى",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  return (
    <div className="p-6">
      {/* ✅ جدول للديسكتوب */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم العميل</TableHead>
              <TableHead className="text-right">اسم الخدمة</TableHead>
              <TableHead className="text-right">الإيميل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">الميزانية</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">مدة الخدمة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="text-right">{req.clientName}</TableCell>
                <TableCell className="text-right">{req.name}</TableCell>
                <TableCell className="text-right">{req.clientEmail}</TableCell>
                <TableCell className="text-right">
                  {req.clientPhone || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {req.budget ? `$${req.budget}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      req.status === "pending"
                        ? "outline"
                        : req.status === "assigned"
                        ? "default"
                        : req.status === "in_progress"
                        ? "secondary"
                        : req.status === "completed"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                </TableCell>
                <TableCell>{req.duration}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Link href={`/attractor/allServices/${req.id}/edit`}>
                        تعديل
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(req.id)}
                    >
                      حذف
                    </Button>
                    {req.status === "in_progress" && role === "attractor" && (
                      <Button variant="default" size="sm" asChild>
                        <Link
                          href={`/attractor/in-progress/${req.id}/contract`}
                        >
                          تفعيل العقد
                        </Link>
                      </Button>
                    )}
                    {req.status === "in_progress" && role === "admin" && (
                      <Button variant="default" size="sm" asChild>
                        <Link
                          href={`/admin/${userId}/services/in-progress/${req.id}/contract`}
                        >
                          تفعيل العقد
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ كارد للموبايل والآيباد */}
      <div className="grid grid-cols-1 gap-4 lg:hidden mt-6 w-full">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border rounded-lg p-4 overflow-hidden  shadow flex flex-col gap-2 bg-gray-50 w-full"
          >
            <p>
              <strong>اسم العميل:</strong> {req.clientName}
            </p>
            <p>
              <strong>اسم الخدمة:</strong> {req.name}
            </p>
            <p>
              <strong>الإيميل:</strong> {req.clientEmail}
            </p>
            <p>
              <strong>الهاتف:</strong> {req.clientPhone || "-"}
            </p>
            <p>
              <strong>الميزانية:</strong> {req.budget ? `$${req.budget}` : "-"}
            </p>
            <p>
              <strong>الحالة:</strong>{" "}
              <Badge
                variant={
                  req.status === "pending"
                    ? "outline"
                    : req.status === "assigned"
                    ? "default"
                    : req.status === "in_progress"
                    ? "secondary"
                    : req.status === "completed"
                    ? "secondary"
                    : "destructive"
                }
              >
                {req.status}
              </Badge>
            </p>
            <p>
              <strong>تاريخ الإنشاء:</strong>{" "}
              {new Date(req.createdAt).toLocaleDateString("ar-EG")}
            </p>
            <p>
              <strong>مدة الخدمة:</strong> {req.duration}
            </p>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href={`/attractor/allServices/${req.id}/edit`}>
                  تعديل
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(req.id)}
                className="w-full sm:w-auto"
              >
                حذف
              </Button>
              {req.status === "in_progress" && role === "attractor" && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href={`/attractor/in-progress/${req.id}/contract`}>
                    تفعيل العقد
                  </Link>
                </Button>
              )}
              {req.status === "in_progress" && role === "admin" && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link
                    href={`/admin/${userId}/services/in-progress/${req.id}/contract`}
                  >
                    تفعيل العقد
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTable;
