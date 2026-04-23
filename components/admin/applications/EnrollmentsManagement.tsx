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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Filter,
  Loader2,
  Trash2,
  Settings2,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const MySwal = withReactContent(Swal);

type Enrollment = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  paymentStatus: string;
  confirmationStatus: string;
  registeredAt: string;
  sectionId: string;
  paymentReceiptUrl: string | null;
  isBlocked: boolean;
  section: {
    sectionNumber: number;
    course: {
      title: string;
      id: string;
    };
  };
};

const EnrollmentsManagement = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  const [coursesData, setCoursesData] = useState<{ id: string; title: string }[]>(
    [],
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, filtersRes] = await Promise.all([
        fetch("/api/admin/enrollments"),
        fetch("/api/admin/applications-filters"),
      ]);

      if (!enrollmentsRes.ok || !filtersRes.ok)
        throw new Error("Failed to fetch data");

      const enrollmentsData = await enrollmentsRes.json();
      const filtersData = await filtersRes.json();

      setEnrollments(enrollmentsData);
      setCoursesData(filtersData.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف تسجيل الطالب نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/course-enrollments/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          MySwal.fire("تم الحذف", "تم حذف التسجيل بنجاح", "success");
          fetchData();
        }
      } catch (error) {
        MySwal.fire("خطأ", "فشل الحذف", "error");
      }
    }
  };

  const handleToggleBlock = async (enrollment: Enrollment) => {
    try {
      setProcessingId(enrollment.id);
      const res = await fetch(`/api/course-enrollments/${enrollment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !enrollment.isBlocked }),
      });

      if (res.ok) {
        MySwal.fire({
          title: enrollment.isBlocked ? "تم إلغاء الحظر" : "تم حظر المحتوى",
          icon: "success",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        fetchData();
      }
    } catch (error) {
      MySwal.fire("خطأ", "فشلت العملية", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReturnToApplicant = async (id: string) => {
    const result = await MySwal.fire({
      title: "إرجاع لطلبات الالتحاق؟",
      text: "سيتم حذف الطالب من هنا وإعادته لقائمة المتقدمين الجدد",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، أرجعه",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        setProcessingId(id);
        const res = await fetch(
          `/api/admin/enrollments/${id}/return-to-applicant`,
          {
            method: "POST",
          },
        );

        if (res.ok) {
          MySwal.fire(
            "تم الإرجاع",
            "تم إعادة الطالب لطلبات الالتحاق",
            "success",
          );
          fetchData();
        } else {
          const data = await res.json();
          MySwal.fire("خطأ", data.message || "فشلت العملية", "error");
        }
      } catch (error) {
        MySwal.fire("خطأ", "فشلت العملية", "error");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const viewReceipt = (url: string) => {
    MySwal.fire({
      title: "إشعار الدفع",
      imageUrl: url,
      imageAlt: "وصل الدفع",
      confirmButtonText: "إغلاق",
      customClass: {
        image: "max-h-[70vh] object-contain",
      },
    });
  };

  const allFilteredEnrollments = enrollments.filter((en) => {
    const matchesSearch =
      en.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (en.studentPhone && en.studentPhone.includes(searchTerm)) ||
      en.section.course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      courseFilter === "all" || en.section.course.id === courseFilter;
    const matchesSection =
      sectionFilter === "all" || en.sectionId === sectionFilter;

    return matchesSearch && matchesCourse && matchesSection;
  });

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredEnrollments.length / itemsPerPage);
  const currentItems = allFilteredEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map((en) => en.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkSMS = async () => {
    if (!bulkMessage) {
      MySwal.fire("تنبيه", "يرجى كتابة نص الرسالة أولاً", "warning");
      return;
    }

    try {
      setIsSendingBulk(true);
      const selectedMobiles = enrollments
        .filter((en) => selectedIds.includes(en.id))
        .map((en) => en.studentPhone)
        .filter((p) => p !== null) as string[];

      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobiles: selectedMobiles,
          text: bulkMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        MySwal.fire("تم الإرسال", data.message, "success");
        setBulkMessage("");
        setSelectedIds([]);
      } else {
        throw new Error("فشل إرسال الرسائل");
      }
    } catch (error: any) {
      MySwal.fire("خطأ", error.message, "error");
    } finally {
      setIsSendingBulk(false);
    }
  };

  const exportToExcel = () => {
    // CSV headers
    const headers = [
      "الاسم",
      "الهاتف",
      "الإيميل",
      "الدورة",
      "الشعبة",
      "حالة الدفع",
      "تاريخ التسجيل",
      "محظور",
    ];

    // CSV rows
    const rows = allFilteredEnrollments.map((en) => [
      en.studentName,
      en.studentPhone || "",
      en.studentEmail,
      en.section.course.title,
      en.section.sectionNumber,
      en.paymentStatus === "paid" ? "مدفوع" : "بانتظار الدفع",
      format(new Date(en.registeredAt), "yyyy-MM-dd"),
      en.isBlocked ? "نعم" : "لا",
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Add UTF-8 BOM for Arabic characters
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `المسجلين_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Get unique sections for filter (filtered by course if selected)
  const sections = Array.from(
    new Map(
      enrollments
        .filter(
          (en) =>
            courseFilter === "all" || en.section.course.id === courseFilter,
        )
        .map((en) => [en.sectionId, { ...en.section, id: en.sectionId }]),
    ).values(),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-medium">جارٍ تحميل المسجلين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            المسجلون فعلياً
          </h2>
          <p className="text-zinc-500 font-medium">
            إدارة الطلاب المسجلين وحالاتهم
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl gap-2 border-zinc-200 font-bold"
            onClick={exportToExcel}
          >
            <Download className="w-4 h-4" />
            تصدير إكسل
          </Button>
          <div className="bg-primary/5 border border-primary/10 p-3 rounded-2xl text-center min-w-[120px]">
            <p className="text-xs text-primary font-bold">إجمالي المسجلين</p>
            <p className="text-xl font-black text-primary">
              {allFilteredEnrollments.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="بحث عن طالب مسجل..."
            className="pr-10 h-12 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary/20 font-bold"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative">
          <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            className="w-full h-12 pr-10 pl-4 rounded-2xl bg-zinc-50 border-none text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setSectionFilter("all"); // Reset section filter
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الدورات</option>
            {coursesData.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            className="w-full h-12 pr-10 pl-4 rounded-2xl bg-zinc-50 border-none text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الشعب</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {courseFilter === "all" ? `${s.course.title} - ` : ""}شعبة{" "}
                {s.sectionNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Area */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border-2 border-primary/20 p-6 rounded-3xl space-y-4 shadow-inner"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {selectedIds.length}
              </div>
              <h3 className="font-black text-lg text-primary">
                عمليات جماعية على المسجلين المحددين
              </h3>
            </div>
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-red-500 rounded-xl"
              onClick={() => setSelectedIds([])}
            >
              إلغاء التحديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-10 relative">
              <Textarea
                placeholder="اكتب نص الرسالة هنا لإرسالها لجميع المسجلين المحددين..."
                className="rounded-2xl border-primary/20 focus:ring-primary/20 min-h-[100px] bg-white pr-10 font-bold"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
              />
              <MessageSquare className="absolute right-3 top-3 w-5 h-5 text-primary/40" />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={handleBulkSMS}
                disabled={isSendingBulk}
                className="w-full h-12 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {isSendingBulk ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "إرسال SMS"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100">
              <TableHead className="w-[50px] px-6">
                <Checkbox
                  checked={
                    selectedIds.length === currentItems.length &&
                    currentItems.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md border-zinc-300"
                />
              </TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">
                الطالب
              </TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">
                الشعبة
              </TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">
                حالة الدفع
              </TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">
                تاريخ التسجيل
              </TableHead>
              <TableHead className="text-left py-5 px-6 w-[120px] font-black text-zinc-900">
                إجراء
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((en) => (
                <TableRow
                  key={en.id}
                  className={`border-zinc-50 hover:bg-zinc-50/30 transition-all group ${selectedIds.includes(en.id) ? "bg-primary/5" : ""}`}
                >
                  <TableCell className="px-6">
                    <Checkbox
                      checked={selectedIds.includes(en.id)}
                      onCheckedChange={() => toggleSelectOne(en.id)}
                      className="rounded-md border-zinc-300"
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {en.studentName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900">
                          {en.studentName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold">
                          {en.studentPhone || en.studentEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-700">
                        {en.section.course.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="w-fit text-[10px] rounded-md font-bold"
                      >
                        شعبة {en.section.sectionNumber}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      className={
                        en.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700 font-bold"
                          : "bg-yellow-100 text-yellow-700 font-bold"
                      }
                    >
                      {en.paymentStatus === "paid" ? "مدفوع" : "بانتظار الدفع"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 text-zinc-500 font-bold text-sm">
                    {format(new Date(en.registeredAt), "dd MMMM yyyy", {
                      locale: ar,
                    })}
                  </TableCell>

                  <TableCell className="py-4 px-6 text-left">
                    <div className="flex items-center justify-end gap-2">
                      {en.paymentReceiptUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:bg-blue-50"
                          onClick={() => viewReceipt(en.paymentReceiptUrl!)}
                          title="عرض الوصل"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-zinc-100"
                          >
                            {processingId === en.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            ) : (
                              <MoreVertical className="w-4 h-4 text-zinc-400" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 rounded-2xl p-2 shadow-2xl border-zinc-100 font-bold"
                        >
                          <DropdownMenuItem
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${en.isBlocked ? "text-green-600" : "text-orange-600"}`}
                            onClick={() => handleToggleBlock(en)}
                          >
                            <Settings2 className="w-4 h-4" />
                            {en.isBlocked ? "تفعيل المحتوى" : "تسكير المحتوى"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-blue-600"
                            onClick={() => handleReturnToApplicant(en.id)}
                          >
                            <Calendar className="w-4 h-4" />
                            إرجاع لطلبات الالتحاق
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(en.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف التسجيل نهائياً
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <p className="font-black text-xl opacity-20">
                    لا يوجد مسجلون حالياً
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 border-t border-zinc-100">
            <p className="text-sm text-zinc-500 font-bold">
              عرض {currentItems.length} من أصل {allFilteredEnrollments.length}{" "}
              طالب
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 border-zinc-200"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`h-10 w-10 rounded-xl font-bold ${currentPage === page ? "bg-primary shadow-lg shadow-primary/20" : "border-zinc-200"}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 border-zinc-200"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentsManagement;
