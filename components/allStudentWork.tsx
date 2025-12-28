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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Swal from "sweetalert2";

interface StudentWork {
  id: string;
  studentId: string;
  studentName: string | null;
  title: string;
  type: "story" | "image" | "video";
  status: "approved" | "pending";
  description?: string | null;
  mediaUrl?: string | null;
}

export default function AllStudentWork({
  works,
  section,
}: {
  works: StudentWork[];
  section: { id: string; name?: string };
}) {
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);
  const [localWorks, setLocalWorks] = useState<StudentWork[]>(works);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"approved" | "pending">(
    "pending"
  );

  // فتح دايلوج العرض
  const handleView = (work: StudentWork) => {
    setSelectedWork(work);
    setOpenViewDialog(true);
  };

  // فتح دايلوج التعديل
  const handleEdit = (work: StudentWork) => {
    setSelectedWork(work);
    setEditTitle(work.title);
    setEditDescription(work.description ?? "");
    setEditStatus(work.status);
    setOpenEditDialog(true);
  };

  // حفظ التعديل
  const handleSaveEdit = async () => {
    if (!selectedWork) return;
    const res = await fetch(`/api/student-work/${selectedWork.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        status: editStatus,
      }),
    });

    if (res.ok) {
      setLocalWorks((prev) =>
        prev.map((w) =>
          w.id === selectedWork.id
            ? {
                ...w,
                title: editTitle,
                description: editDescription,
                status: editStatus,
              }
            : w
        )
      );
      Swal.fire({
        icon: "success",
        title: "تم التعديل ✅",
        text: "تم تعديل العمل بنجاح",
        timer: 2000,
      });
      setOpenEditDialog(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "فشل التعديل ❌",
        text: "حدث خطأ أثناء التعديل",
      });
    }
  };

  // الحذف
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا العمل بشكل نهائي",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`/api/student-work/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocalWorks((prev) => prev.filter((work) => work.id !== id));
        Swal.fire({
          icon: "success",
          title: "تم الحذف ✅",
          text: "تم حذف العمل بنجاح",
          timer: 2000,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل الحذف ❌",
          text: "حدث خطأ أثناء الحذف",
        });
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        📋 جميع أعمال الطلاب في الشعبة {section?.name ?? ""}
      </h2>

      {/* جدول */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الطالب</TableHead>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localWorks.map((work) => (
            <TableRow key={work.id}>
              <TableCell>{work.studentName}</TableCell>
              <TableCell>{work.title}</TableCell>
              <TableCell>
                {work.type === "story"
                  ? "📖 قصة"
                  : work.type === "image"
                  ? "🖼️ صورة"
                  : "🎥 فيديو"}
              </TableCell>
              <TableCell>
                {work.status === "approved"
                  ? "✅ مقبول"
                  : work.status === "pending"
                  ? "⏳ قيد المراجعة"
                  : "❌ مرفوض"}
              </TableCell>
              <TableCell className="flex gap-2 justify-center">
                {(work.mediaUrl || work.type === "story") && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleView(work)}
                  >
                    👁️ عرض
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(work)}
                >
                  ✏️ تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(work.id)}
                >
                  🗑️ حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog العرض */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedWork?.title}
            </DialogTitle>
          </DialogHeader>
          <Card className="w-full shadow-md">
            <CardContent className="flex flex-col items-center gap-4 p-4">
              {selectedWork?.type === "image" && selectedWork?.mediaUrl && (
                <>
                  <Image
                    src={selectedWork.mediaUrl}
                    alt={selectedWork.title}
                    className="w-full rounded object-contain"
                    width={400}
                    height={300}
                    unoptimized
                  />
                  {selectedWork?.description && (
                    <p className="mt-2 text-gray-700 text-center">
                      {selectedWork.description}
                    </p>
                  )}
                </>
              )}
              {selectedWork?.type === "video" && selectedWork?.mediaUrl && (
                <>
                  <video
                    src={selectedWork.mediaUrl}
                    controls
                    className="w-full rounded"
                  />
                  {selectedWork?.description && (
                    <p className="mt-2 text-gray-700 text-center">
                      {selectedWork.description}
                    </p>
                  )}
                </>
              )}
              {selectedWork?.type === "story" && (
                <p className="mt-2 text-gray-700 text-center">
                  {selectedWork?.description}
                </p>
              )}
            </CardContent>
          </Card>
          <DialogFooter className="flex justify-center mt-4">
            <Button onClick={() => setOpenViewDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog التعديل */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-center">تعديل العمل</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="border p-2 rounded"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="العنوان"
            />
            <textarea
              className="border p-2 rounded"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="الوصف"
            />
            <select
              className="border p-2 rounded"
              value={editStatus}
              onChange={(e) =>
                setEditStatus(e.target.value as "approved" | "pending")
              }
            >
              <option value="pending">⏳ قيد المراجعة</option>
              <option value="approved">✅ مقبول</option>
            </select>
          </div>
          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
