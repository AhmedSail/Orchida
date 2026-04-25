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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Film,
  BookOpen,
  User,
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  FolderOpen,
} from "lucide-react";

interface StudentWork {
  id: string;
  studentId: string | null;
  studentName: string | null;
  userName?: string | null; // From joined users table
  title: string;
  type: "story" | "image" | "video";
  status: "approved" | "pending";
  description?: string | null;
  mediaUrl?: string | null;
  youtubeUrl?: string | null;
}

export default function AllStudentWork({
  works,
  section,
}: {
  works: StudentWork[];
  section: { id: string; sectionNumber?: number; courseTitle?: string };
}) {
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);
  const [localWorks, setLocalWorks] = useState<StudentWork[]>(works);
  const [searchTerm, setSearchTerm] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"approved" | "pending">(
    "pending",
  );

  const filteredWorks = localWorks.filter(
    (w) =>
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.studentName &&
        w.studentName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleView = (work: StudentWork) => {
    setSelectedWork(work);
    setOpenViewDialog(true);
  };

  const handleEdit = (work: StudentWork) => {
    setSelectedWork(work);
    setEditTitle(work.title);
    setEditDescription(work.description ?? "");
    setEditStatus(work.status);
    setOpenEditDialog(true);
  };

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
            : w,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "تم التعديل ✅",
        text: "تم تعديل العمل بنجاح",
        timer: 2000,
        showConfirmButton: false,
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

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا العمل بشكل نهائي ولا يمكن التراجع",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
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
          showConfirmButton: false,
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

  const getWorkIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="size-4 text-emerald-500" />;
      case "video":
        return <Film className="size-4 text-blue-500" />;
      case "story":
        return <BookOpen className="size-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8" dir="rtl">
      {/* 🚀 Stylish Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <GraduationCap size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              إدارة أعمال الطلاب
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {section?.courseTitle || "الدورة"} -{" "}
              <span className="text-primary font-bold">
                شعبة رقم {section?.sectionNumber || ""}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <div className="px-6 py-3 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              إجمالي الأعمال
            </p>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {localWorks.length}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="px-6 py-3 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              في انتظار المراجعة
            </p>
            <p className="text-2xl font-black text-amber-500 leading-none">
              {localWorks.filter((w) => w.status === "pending").length}
            </p>
          </div>
        </div>
      </div>

      {/* 🛠️ Actions & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <Input
            placeholder="بحث باسم الطالب أو عنوان العمل..."
            className="h-14 pr-12 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* We can add a "New Work" button here if needed */}
      </div>

      {/* 📝 Content Table / Grid */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              <TableHead className="text-right px-8 py-6 font-black text-gray-400 text-xs uppercase tracking-widest">
                الطالب
              </TableHead>
              <TableHead className="text-right px-8 py-6 font-black text-gray-400 text-xs uppercase tracking-widest">
                العمل
              </TableHead>
              <TableHead className="text-right px-8 py-6 font-black text-gray-400 text-xs uppercase tracking-widest">
                النوع
              </TableHead>
              <TableHead className="text-right px-8 py-6 font-black text-gray-400 text-xs uppercase tracking-widest">
                الحالة
              </TableHead>
              <TableHead className="text-center px-8 py-6 font-black text-gray-400 text-xs uppercase tracking-widest">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredWorks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <FolderOpen size={48} className="opacity-20" />
                      <p className="font-bold">لا توجد أعمال لعرضها حالياً</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorks.map((work, index) => (
                  <motion.tr
                    key={work.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors"
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <User size={18} />
                        </div>
                        <span className="font-bold text-gray-900">
                          {work.studentName || work.userName || "طالب مجهول"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="font-bold text-gray-700 line-clamp-1">
                        {work.title}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
                          {getWorkIcon(work.type)}
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          {work.type === "story"
                            ? "قصة"
                            : work.type === "image"
                              ? "صورة"
                              : "فيديو"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      {work.status === "approved" ? (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1 rounded-full gap-1 font-black text-[10px]">
                          <CheckCircle className="size-3" /> مقبول
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-none px-3 py-1 rounded-full gap-1 font-black text-[10px]">
                          <Clock className="size-3" /> قيد المراجعة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(work)}
                          className="size-10 rounded-xl bg-white shadow-sm border border-gray-100 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(work)}
                          className="size-10 rounded-xl bg-white shadow-sm border border-gray-100 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                        >
                          <Edit3 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(work.id)}
                          className="size-10 rounded-xl bg-white shadow-sm border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* 🖼️ View Work Modal */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-3xl w-full rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="flex flex-col md:flex-row h-full">
            {/* Media Area */}
            <div className="flex-1 bg-gray-900 min-h-[400px] flex items-center justify-center relative">
              {selectedWork?.youtubeUrl ? (
                 <iframe
                    src={selectedWork.youtubeUrl.includes('watch?v=') 
                      ? selectedWork.youtubeUrl.replace('watch?v=', 'embed/') 
                      : selectedWork.youtubeUrl.includes('youtu.be/')
                        ? selectedWork.youtubeUrl.replace('youtu.be/', 'youtube.com/embed/')
                        : selectedWork.youtubeUrl}
                    className="w-full h-full border-none aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
              ) : selectedWork?.type === "image" && selectedWork.mediaUrl ? (
                <img
                  src={selectedWork.mediaUrl}
                  alt={selectedWork.title}
                  className="w-full h-full object-contain"
                />
              ) : selectedWork?.type === "video" && selectedWork.mediaUrl ? (
                <video
                  src={selectedWork.mediaUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              ) : selectedWork?.type === "story" && (
                <BookOpen size={120} className="text-white/20" />
              )}

              <div className="absolute top-6 right-6">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-none px-4 py-2 rounded-xl font-black">
                  {selectedWork?.type === "story"
                    ? "قصة نجاح"
                    : selectedWork?.type === "image"
                      ? "صورة إبداعية"
                      : "فيديو توثيقي"}
                </Badge>
              </div>
            </div>

            {/* Info Area */}
            <div className="w-full md:w-80 p-8 flex flex-col justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {selectedWork?.title}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={12} />
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    {selectedWork?.studentName || selectedWork?.userName || "طالب أوركيدة"}
                  </span>
                </div>

                <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedWork?.description}
                </p>
              </div>

              <Button
                onClick={() => setOpenViewDialog(false)}
                className="mt-10 w-full rounded-2xl h-12 font-black bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                إغلاق المعاينة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✏️ Edit Work Modal */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md w-full rounded-[2.5rem] p-8 bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 text-center">
              تعديل بيانات العمل
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-gray-500">
              تعديل العنوان والوصف وحالة النشر
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">
                العنوان
              </label>
              <Input
                className="h-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="عنوان العمل"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">
                الوصف
              </label>
              <Textarea
                className="rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="وصف العمل أو قصة النجاح..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">
                حالة العمل
              </label>
              <Select
                value={editStatus}
                onValueChange={(val) =>
                  setEditStatus(val as "approved" | "pending")
                }
              >
                <SelectTrigger
                  className="h-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20"
                  dir="rtl"
                >
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl" dir="rtl">
                  <SelectItem value="pending" className="rounded-xl">
                    ⏳ قيد المراجعة
                  </SelectItem>
                  <SelectItem value="approved" className="rounded-xl">
                    ✅ مقبول (نشر على الموقع)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col md:flex-row gap-3 mt-10">
            <Button
              variant="outline"
              onClick={() => setOpenEditDialog(false)}
              className="flex-1 rounded-2xl h-12 font-black border-gray-100 text-gray-400 hover:bg-gray-50"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 rounded-2xl h-12 font-black bg-primary text-white shadow-lg shadow-primary/20"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
