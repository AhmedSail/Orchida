"use client";

import React from "react";
import { ServiceRequests } from "@/src/modules/home/ui/view/home-view";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ClientServices = ({
  requests,
  userId,
}: {
  requests: ServiceRequests[];
  userId: string;
}) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        لا يوجد خدمات مطلوبة حالياً
      </div>
    );
  }
  const router = useRouter();

  return (
    <div className="p-6 container mx-auto h-screen">
      <h2 className="text-2xl font-bold mb-6 text-right text-primary">
        خدماتي المطلوبة
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-right font-semibold">
                اسم الخدمة
              </TableHead>
              <TableHead className="text-right font-semibold">
                الميزانية
              </TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">
                المدة المطلوبة
              </TableHead>
              <TableHead className="text-right font-semibold">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow
                key={req.id}
                className="hover:bg-gray-50 transition-colors"
                dir="rtl"
              >
                <TableCell className="font-medium">{req.name}</TableCell>

                <TableCell>
                  {req.budget ? `$${req.budget}` : "غير محددة"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      req.status === "pending"
                        ? "secondary"
                        : req.status === "completed"
                        ? "default"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>{req.duration}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Link href={`/serviceRequest/${req.id}`}>تعديل</Link>
                    </Button>
                    {req.status === "in_progress" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Link href={`/serviceRequest/${req.id}/contract`}>
                          العقد
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
      <div className="flex justify-center mt-4 ">
        <Button
          variant="default"
          size="sm"
          className="cursor-pointer w-1/2"
          onClick={() => router.push("/serviceRequest")}
        >
          إضافة طلب جديد
        </Button>
      </div>
    </div>
  );
};

export default ClientServices;
