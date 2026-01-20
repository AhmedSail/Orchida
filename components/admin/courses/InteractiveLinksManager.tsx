"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  Search,
  Filter,
  Users,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Course {
  id: string;
  title: string;
  isActive: boolean;
}

interface InteractiveLink {
  id: string;
  courseId: string;
  title: string;
  description: string;
  url: string;
  target: "student" | "instructor" | "both";
  isActive: boolean;
  createdAt: string;
}

interface Props {
  initialCourses: Course[];
}

export default function InteractiveLinksManager({ initialCourses }: Props) {
  const [courses] = useState<Course[]>(
    initialCourses.filter((c) => c.isActive),
  );
  const [links, setLinks] = useState<InteractiveLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    instructorUrl: "",
    studentUrl: "",
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interactive-links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (error) {
      toast.error("فشل في تحميل الروابط");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!formData.courseId || !formData.title || !formData.description) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!formData.instructorUrl && !formData.studentUrl) {
      toast.error("يجب إدخال رابط واحد على الأقل (للمدرب أو للطالب)");
      return;
    }

    try {
      const res = await fetch("/api/interactive-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تمت إضافة الروابط بنجاح");
        setIsModalOpen(false);
        setFormData({
          courseId: "",
          title: "",
          description: "",
          instructorUrl: "",
          studentUrl: "",
        });
        fetchLinks();
      } else {
        toast.error("فشل في إضافة الروابط");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لا يمكن التراجع عن هذا الإجراء",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/interactive-links/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setLinks(links.filter((l) => l.id !== id));
          toast.success("تم الحذف بنجاح");
        }
      } catch (error) {
        toast.error("فشل في الحذف");
      }
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch = link.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourseId === "all" || link.courseId === selectedCourseId;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 p-4" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            الروابط التفاعلية للدورات
          </h1>
          <p className="text-slate-500">
            إدارة الروابط الخارجية والموارد التفاعلية لكل دورة
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 rounded-xl"
        >
          <Plus className="size-4" />
          إضافة رابط جديد
        </Button>
      </div>

      <Card className="rounded-[24px] border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="بحث عن رابط..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="تصفية حسب الدورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدورات</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right font-bold w-[250px]">
                    العنوان
                  </TableHead>
                  <TableHead className="text-right font-bold">الدورة</TableHead>
                  <TableHead className="text-right font-bold">
                    المستهدف
                  </TableHead>
                  <TableHead className="text-right font-bold">الرابط</TableHead>
                  <TableHead className="text-center font-bold">
                    إجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {link.title}
                          </span>
                          <span className="text-xs text-slate-500 line-clamp-1">
                            {link.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-lg bg-slate-50"
                        >
                          {courses.find((c) => c.id === link.courseId)?.title ||
                            "دورة غير معروفة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {link.target === "instructor" ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-lg gap-1">
                            <Users className="size-3" /> مدرب
                          </Badge>
                        ) : link.target === "student" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-lg gap-1">
                            <GraduationCap className="size-3" /> طالب
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none rounded-lg gap-1">
                            كلاهما
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
                        >
                          <ExternalLink className="size-3" />
                          عرض الرابط
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(link.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-slate-500"
                    >
                      {loading
                        ? "جاري التحميل..."
                        : "لا توجد روابط مضافة حالياً"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              إضافة روابط تفاعلية جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-slate-700">
                اختر الدورة
              </label>
              <Select
                value={formData.courseId}
                onValueChange={(val) =>
                  setFormData({ ...formData, courseId: val })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="اختر الدورة المستهدفة" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-slate-700">
                عنوان الرابط
              </label>
              <Input
                placeholder="مثال: ملف المخططات الهندسية"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-slate-700">
                وصف مختصر
              </label>
              <Textarea
                placeholder="وصف لما يحتوي عليه هذا الرابط..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="space-y-2 text-right p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="size-4 text-blue-600" />
                  <label className="text-sm font-bold text-blue-800">
                    رابط المدرب (اختياري)
                  </label>
                </div>
                <Input
                  placeholder="https://..."
                  value={formData.instructorUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorUrl: e.target.value })
                  }
                  className="rounded-xl bg-white border-blue-200"
                />
              </div>

              <div className="space-y-2 text-right p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="size-4 text-emerald-600" />
                  <label className="text-sm font-bold text-emerald-800">
                    رابط الطلاب (اختياري)
                  </label>
                </div>
                <Input
                  placeholder="https://..."
                  value={formData.studentUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, studentUrl: e.target.value })
                  }
                  className="rounded-xl bg-white border-emerald-200"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              * يجب تعبئة رابط واحد على الأقل. سيتم إنشاء سجل منفصل لكل رابط إذا
              تم تعبئة الاثنين.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl flex-1"
            >
              إلغاء
            </Button>
            <Button onClick={handleAddLink} className="rounded-xl flex-1">
              إضافة وحفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
