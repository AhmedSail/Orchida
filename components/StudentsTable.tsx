"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  UserCheck,
  UserPlus,
  Users,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  confirmationStatus: "pending" | "confirmed" | "rejected";
  registeredAt: Date | string;
  paymentReceiptUrl?: string | null;
  isReceiptUploaded?: boolean;
  IBAN: string | null;
  type: "registered" | "interested";
  status?: string | null; // for leads
  notes?: string | null;
  studentMajor?: string | null;
  studentCountry?: string | null;
  isSuggested?: boolean;
  previousStatus?: string | null;
  originalSectionNumber?: number | null;
};

const StudentsTable = ({
  students,
  currentSectionId,
  courseId,
}: {
  students: Student[];
  currentSectionId: string;
  courseId: string;
}) => {
  const [studentList, setStudentList] = useState<Student[]>(students);
  const [activeTab, setActiveTab] = useState<
    "all" | "registered" | "interested"
  >("all");

  // فلترة وفرز
  const [filterPayment, setFilterPayment] = useState<
    "all" | "paid" | "pending" | "failed"
  >("all");
  const [filterLeadStatus, setFilterLeadStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "date_asc" | "date_desc" | "status_asc"
  >("date_desc");
  const [searchName, setSearchName] = useState<string>("");
  const [showIBAN, setShowIBAN] = useState(false);

  // باجينيشن
  const [currentPage, setCurrentPage] = useState<number>(1);
  const studentsPerPage = 10;

  const [ibanValues, setIbanValues] = useState<{ [key: string]: string }>({});
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});

  // SMS States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [smsMessage, setSmsMessage] = useState<string>("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [templates, setTemplates] = useState<
    { id: string; title: string; content: string }[]
  >([]);

  useEffect(() => {
    // جلب القوالب
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/sms/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch (e) {
        console.error("Failed to fetch templates", e);
      }
    };
    fetchTemplates();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === currentStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentStudents.map((s) => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSendBulkSMS = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("تنبيه", "يرجى اختيار طالب واحد على الأقل", "warning");
      return;
    }
    if (!smsMessage.trim()) {
      Swal.fire("تنبيه", "يرجى كتابة نص الرسالة", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "إرسال رسائل جماعية؟",
      text: `سيتم إرسال الرسالة إلى ${selectedIds.length} طالب.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، أرسل الآن",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981",
    });

    if (!result.isConfirmed) return;

    setIsSendingSms(true);
    try {
      const selectedMobiles = studentList
        .filter((s) => selectedIds.includes(s.id) && s.studentPhone)
        .map((s) => s.studentPhone as string);

      if (selectedMobiles.length === 0) {
        Swal.fire("خطأ", "الطلاب المختارون ليس لديهم أرقام هواتف", "error");
        return;
      }

      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobiles: selectedMobiles,
          text: smsMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        Swal.fire("تم بنجاح!", data.message, "success");
        setSmsMessage("");
        setSelectedIds([]);
      } else {
        const error = await res.json();
        Swal.fire("فشل!", error.message || "فشل إرسال الرسائل", "error");
      }
    } catch (error) {
      Swal.fire("خطأ", "حدث خطأ أثناء الاتصال بالسيرفر", "error");
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleUpdateEnrollment = async (
    id: string,
    updates: Partial<Student>
  ) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم تحديث بيانات الطالب!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، حدّث",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#3b82f6",
    });
    if (!result.isConfirmed) return;

    const student = studentList.find((s) => s.id === id);
    if (!student) return;

    try {
      const isLead = student.type === "interested";
      let endpoint = isLead
        ? `/api/course-leads/${id}`
        : `/api/course-enrollments/${id}`;
      let method = isLead ? "PATCH" : "PUT";
      let bodyData: any = { ...updates };

      // إذا كان "مقترح"، ننشئ له سجل جديد في هذه الشعبة بدلاً من تعديل القديم
      if (isLead && student.isSuggested) {
        endpoint = `/api/course-leads`;
        method = "POST";
        bodyData = {
          ...updates,
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          studentPhone: student.studentPhone,
          sectionId: currentSectionId,
          courseId: courseId,
          status: updates.status || student.status,
          notes: updates.notes || student.notes,
        };
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const data = await res.json();
        const newId = data.lead?.id || id;

        Swal.fire({
          icon: "success",
          title: "تم التحديث!",
          timer: 1500,
          showConfirmButton: false,
        });

        setStudentList((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...updates,
                  id: newId,
                  isSuggested: false,
                  // إذا كان مقترح وتم تحديثه، يصبح طالب حقيقي في هذه الشعبة
                }
              : s
          )
        );
      } else {
        Swal.fire("خطأ!", "فشل في تحديث البيانات.", "error");
      }
    } catch {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    }
  };

  const handleDelete = async (
    id: string,
    type: "registered" | "interested"
  ) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف البيانات نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;

    try {
      const endpoint =
        type === "interested"
          ? `/api/course-leads/${id}`
          : `/api/course-enrollments/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        Swal.fire("تم الحذف!", "تم الحذف بنجاح.", "success");
        setStudentList((prev) => prev.filter((s) => s.id !== id));
      } else {
        Swal.fire("خطأ!", "فشل في الحذف.", "error");
      }
    } catch {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    }
  };

  const convertLeadToRegistered = async (lead: Student) => {
    // Logic to convert interested to registered
    const result = await Swal.fire({
      title: "تحويل الطالب؟",
      text: "سيتم تحويل الطالب من مهتم إلى مسجل رسمي في الدورة.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "نعم، قم بالتحويل",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/course-leads/${lead.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSectionId: lead.isSuggested ? currentSectionId : undefined,
        }),
      });
      if (res.ok) {
        Swal.fire("تم التحويل!", "تم تسجيل الطالب بنجاح.", "success");
        // Reload list or update state
        setStudentList((prev) =>
          prev.map((s) => (s.id === lead.id ? { ...s, type: "registered" } : s))
        );
      }
    } catch (e) {
      Swal.fire("خطأ", "حدث خطأ أثناء التحويل", "error");
    }
  };

  const filteredSorted = useMemo(() => {
    let data = [...studentList];

    // تبويب
    if (activeTab !== "all") {
      data = data.filter((s) => s.type === activeTab);
    }

    // فلترة الدفع (للمسجلين)
    if (filterPayment !== "all") {
      data = data.filter((s) => s.paymentStatus === filterPayment);
    }

    // فلترة حالة الطلب (للمهتمين)
    if (filterLeadStatus !== "all") {
      data = data.filter((s) => s.status === filterLeadStatus);
    }

    // بحث بالاسم
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      data = data.filter((s) => s.studentName.toLowerCase().includes(q));
    }

    // فرز
    data.sort((a, b) => {
      const dateA = new Date(a.registeredAt).getTime();
      const dateB = new Date(b.registeredAt).getTime();

      if (sortBy === "name_asc")
        return a.studentName.localeCompare(b.studentName, "ar");
      if (sortBy === "name_desc")
        return b.studentName.localeCompare(a.studentName, "ar");
      if (sortBy === "date_asc") return dateA - dateB;
      if (sortBy === "status_asc") {
        const statusA =
          a.type === "interested" ? a.status || "" : a.paymentStatus;
        const statusB =
          b.type === "interested" ? b.status || "" : b.paymentStatus;
        return statusA.localeCompare(statusB, "ar");
      }
      return dateB - dateA;
    });

    return data;
  }, [
    studentList,
    activeTab,
    filterPayment,
    filterLeadStatus,
    searchName,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredSorted.length / studentsPerPage) || 1;
  const currentStudents = filteredSorted.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  const getStatusBadge = (status: string | null | undefined, type: string) => {
    if (type === "interested") {
      switch (status) {
        case "new":
          return (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              جديد
            </Badge>
          );
        case "contacted":
          return (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              تم التواصل
            </Badge>
          );
        case "interested":
          return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              مهتم
            </Badge>
          );
        case "no_response":
          return (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              لم يرد
            </Badge>
          );
        case "high_price":
          return (
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200">
              السعر مرتفع
            </Badge>
          );
        case "wants_online":
          return (
            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
              يريد أونلاين
            </Badge>
          );
        case "future_course":
          return (
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              الدورة القادمة
            </Badge>
          );
        case "cancel_reg":
          return (
            <Badge className="bg-rose-100 text-rose-700 border-rose-200">
              إلغاء التسجيل
            </Badge>
          );
        case "far_location":
          return (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              المكان بعيد
            </Badge>
          );
        case "busy_morning":
          return (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              مشغول فترة صباحية
            </Badge>
          );
        case "busy_evening":
          return (
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              مشغول فترة مسائية
            </Badge>
          );
        default:
          return (
            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
              {status || "غير محدد"}
            </Badge>
          );
      }
    }

    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            مدفوع
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            معلق
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">فشل</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Cards / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">الكل</p>
            <p className="text-2xl font-bold">{studentList.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">مسجلين</p>
            <p className="text-2xl font-bold">
              {studentList.filter((s) => s.type === "registered").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">مهتمين</p>
            <p className="text-2xl font-bold">
              {studentList.filter((s) => s.type === "interested").length}
            </p>
          </div>
        </div>
      </div>

      {/* SMS Sending Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <MessageSquare className="w-5 h-5" />
          <div className="flex items-center gap-2">
            <h2 className="font-bold">إرسال رسائل SMS جماعية</h2>
            <div className="flex-1"></div>
            <Select
              onValueChange={(val) => {
                const tmpl = templates.find((t) => t.id === val);
                if (tmpl) setSmsMessage(tmpl.content);
              }}
            >
              <SelectTrigger className="w-[200px] h-9 text-xs rounded-lg border-emerald-200">
                <SelectValue placeholder="اختر رسالة جاهزة..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Textarea
              placeholder="اكتب نص الرسالة هنا..."
              className="rounded-xl border-gray-200 min-h-[100px] resize-none focus:ring-emerald-500"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 text-right">
            <div className="text-sm text-gray-500 mb-2">
              المختارون:{" "}
              <span className="font-bold text-emerald-600">
                {selectedIds.length}
              </span>{" "}
              طالب
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 h-12 px-8 shadow-lg shadow-emerald-100"
              disabled={isSendingSms || selectedIds.length === 0}
              onClick={handleSendBulkSMS}
            >
              {isSendingSms ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              إرسال الرسالة
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "all"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab("registered")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "registered"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              المسجلين
            </button>
            <button
              onClick={() => setActiveTab("interested")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "interested"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              المهتمين
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="ابحث بالاسم..."
                className="pr-10 bg-gray-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500 w-[250px]"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-gray-200"
              onClick={() => setShowIBAN(!showIBAN)}
            >
              {showIBAN ? "إخفاء IBAN" : "رفع IBAN"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">فلترة:</span>
          </div>

          <Select
            value={filterPayment}
            onValueChange={(v: any) => setFilterPayment(v)}
          >
            <SelectTrigger className="h-9 w-[130px] rounded-lg border-gray-200">
              <SelectValue placeholder="حالة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="paid">مدفوع</SelectItem>
              <SelectItem value="pending">بانتظار</SelectItem>
              <SelectItem value="failed">فشل</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterLeadStatus}
            onValueChange={(v: any) => setFilterLeadStatus(v)}
          >
            <SelectTrigger className="h-9 w-[150px] rounded-lg border-gray-200">
              <SelectValue placeholder="حالة المهتمين" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل حالات المهتمين</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="contacted">تم التواصل</SelectItem>
              <SelectItem value="no_response">لم يرد</SelectItem>
              <SelectItem value="high_price">السعر مرتفع</SelectItem>
              <SelectItem value="wants_online">يريد أونلاين</SelectItem>
              <SelectItem value="future_course">الدورة القادمة</SelectItem>
              <SelectItem value="far_location">المكان بعيد</SelectItem>
              <SelectItem value="cancel_reg">يريد إلغاء التسجيل</SelectItem>
              <SelectItem value="busy_morning">مشغول فترة صباحية</SelectItem>
              <SelectItem value="busy_evening">مشغول فترة مسائية</SelectItem>
              <SelectItem value="interested">مهتم</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-9 w-[160px] rounded-lg border-gray-200">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">الأحدث أولاً</SelectItem>
              <SelectItem value="date_asc">الأقدم أولاً</SelectItem>
              <SelectItem value="name_asc">الاسم (أ - ي)</SelectItem>
              <SelectItem value="name_desc">الاسم (ي - أ)</SelectItem>
              <SelectItem value="status_asc">حالة الطالب</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Desktop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden lg:block">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-12 py-4">
                <Checkbox
                  checked={
                    currentStudents.length > 0 &&
                    selectedIds.length === currentStudents.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-right py-4">الطالب</TableHead>
              <TableHead className="text-right">الاتصال</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">إشعار الدفع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              {showIBAN && <TableHead className="text-right">IBAN</TableHead>}
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.length > 0 ? (
              currentStudents.map((s) => (
                <TableRow
                  key={s.id}
                  className={cn(
                    "hover:bg-blue-50/20 transition-colors",
                    selectedIds.includes(s.id) && "bg-emerald-50/30"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(s.id)}
                      onCheckedChange={() => toggleSelectStudent(s.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        {s.studentName}
                        {s.isSuggested && (
                          <Badge className="bg-purple-50 text-purple-600 border-purple-100 text-[10px] py-0 h-4 px-1 gap-1">
                            <Sparkles className="w-2 h-2" /> مقترح
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full mt-1">
                        {s.type === "registered" ? "مسجل" : "مهتم"}
                      </span>
                      {s.isSuggested && (
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          <span className="text-gray-400">
                            كان في شعبة {s.originalSectionNumber}:
                          </span>
                          {getStatusBadge(s.previousStatus, "interested")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>{s.studentEmail || "-"}</span>
                      <div className="flex items-center gap-2">
                        <span dir="ltr" className="text-right">
                          {s.studentPhone || "-"}
                        </span>
                        {s.studentPhone && (
                          <a
                            href={`https://wa.me/${(s.studentPhone.startsWith(
                              "05"
                            ) && s.studentPhone.length === 10
                              ? "970" + s.studentPhone.substring(1)
                              : s.studentPhone
                            ).replace("+", "")}${
                              smsMessage
                                ? `?text=${encodeURIComponent(smsMessage)}`
                                : ""
                            }`}
                            target="_blank"
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="إرسال واتساب"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="size-4 fill-current"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.02L0 24l6.135-1.61a11.783 11.783 0 005.912 1.587h.005c6.632 0 12.05-5.419 12.05-12.054a11.772 11.772 0 00-3.41-8.483" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(s.registeredAt).toLocaleDateString("ar-EG")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.isReceiptUploaded && s.paymentReceiptUrl ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                          >
                            <Eye className="w-4 h-4" /> عرض
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>
                              إشعار الدفع - {s.studentName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
                            <Image
                              src={s.paymentReceiptUrl}
                              alt="Receipt"
                              fill
                              className="object-contain bg-gray-50"
                              unoptimized
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        لا يوجد
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      s.type === "interested" ? s.status : s.paymentStatus,
                      s.type
                    )}
                  </TableCell>

                  {showIBAN && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <input
                          className="bg-gray-50 border-none rounded-lg px-3 py-1 text-sm w-[150px] focus:ring-1 focus:ring-blue-500"
                          placeholder="أدخل IBAN"
                          value={ibanValues[s.id] ?? s.IBAN ?? ""}
                          onChange={(e) =>
                            setIbanValues({
                              ...ibanValues,
                              [s.id]: e.target.value,
                            })
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600"
                          onClick={() =>
                            handleUpdateEnrollment(s.id, {
                              IBAN: ibanValues[s.id],
                            })
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          {s.type === "interested" && (
                            <>
                              <DropdownMenuItem
                                className="text-blue-600 gap-2 font-bold"
                                onClick={() => convertLeadToRegistered(s)}
                              >
                                <UserCheck className="w-4 h-4" /> تحويل لمسجل
                              </DropdownMenuItem>

                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2">
                                  تحديث حالة الطلب
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "new",
                                      })
                                    }
                                  >
                                    جديد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "contacted",
                                      })
                                    }
                                  >
                                    تم التواصل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "no_response",
                                      })
                                    }
                                  >
                                    لم يرد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "high_price",
                                      })
                                    }
                                  >
                                    السعر مرتفع
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "wants_online",
                                      })
                                    }
                                  >
                                    يريد أونلاين
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "future_course",
                                      })
                                    }
                                  >
                                    الدورة القادمة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "far_location",
                                      })
                                    }
                                  >
                                    المكان بعيد
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "cancelled",
                                      })
                                    }
                                  >
                                    ألغى
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "busy_morning",
                                      })
                                    }
                                  >
                                    مشغول فترة صباحية
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "busy_evening",
                                      })
                                    }
                                  >
                                    مشغول فترة مسائية
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "cancel_reg",
                                      })
                                    }
                                  >
                                    يريد إلغاء التسجيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        status: "interested",
                                      })
                                    }
                                  >
                                    مهتم
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </>
                          )}

                          {s.type === "registered" && (
                            <>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2">
                                  تدرج الحالة
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        paymentStatus: "paid",
                                      })
                                    }
                                  >
                                    مدفوع
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        paymentStatus: "pending",
                                      })
                                    }
                                  >
                                    معلق
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateEnrollment(s.id, {
                                        paymentStatus: "failed",
                                      })
                                    }
                                  >
                                    فشل
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </>
                          )}

                          <DropdownMenuItem
                            className="gap-2 text-blue-600"
                            onClick={() => {
                              Swal.fire({
                                title: "ملاحظات الطالب",
                                text: s.notes || "لا يوجد ملاحظات",
                                icon: "info",
                                confirmButtonText: "إغلاق",
                              });
                            }}
                          >
                            <MessageSquare className="w-4 h-4" /> عرض الملاحظات
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 gap-2 cursor-pointer"
                            onClick={() => handleDelete(s.id, s.type)}
                          >
                            <Trash2 className="w-4 h-4" /> حذف البيانات
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <AlertCircle className="w-10 h-10 opacity-20" />
                    <p>لا يوجد نتائج مطابقة للبحث</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Grid */}
      <div className="lg:hidden grid gap-4">
        {currentStudents.map((s) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                  {s.studentName}
                  {s.isSuggested && (
                    <Sparkles className="w-3 h-3 text-purple-500" />
                  )}
                </h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {s.type === "registered" ? "مسجل" : "مهتم"}
                  </Badge>
                  {s.isSuggested && (
                    <div className="flex items-center gap-1 text-[9px] bg-purple-50 text-purple-700 px-2 rounded-full border border-purple-100">
                      <span>{s.originalSectionNumber} ←</span>
                      {getStatusBadge(s.previousStatus, "interested")}
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(
                s.type === "interested" ? s.status : s.paymentStatus,
                s.type
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-gray-400">الإيميل</span>
                <span className="truncate">{s.studentEmail || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">الهاتف</span>
                <div className="flex items-center gap-1">
                  <span>{s.studentPhone || "-"}</span>
                  {s.studentPhone && (
                    <a
                      href={`https://wa.me/${(s.studentPhone.startsWith("05") &&
                      s.studentPhone.length === 10
                        ? "970" + s.studentPhone.substring(1)
                        : s.studentPhone
                      ).replace("+", "")}${
                        smsMessage
                          ? `?text=${encodeURIComponent(smsMessage)}`
                          : ""
                      }`}
                      target="_blank"
                      className="text-green-600"
                    >
                      <svg viewBox="0 0 24 24" className="size-3 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.02L0 24l6.135-1.61a11.783 11.783 0 005.912 1.587h.005c6.632 0 12.05-5.419 12.05-12.054a11.772 11.772 0 00-3.41-8.483" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
              <span className="text-xs text-gray-400">تاريخ التسجيل</span>
              <span className="text-xs font-medium">
                {new Date(s.registeredAt).toLocaleDateString("ar-EG")}
              </span>
            </div>

            <div className="flex gap-2">
              {s.isReceiptUploaded && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-9 text-xs gap-2"
                >
                  <Eye className="w-3 h-3" /> عرض الإيصال
                </Button>
              )}
              <Button
                variant="destructive"
                className="bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-xl h-9 px-3"
                onClick={() => handleDelete(s.id, s.type)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">
          عرض {(currentPage - 1) * studentsPerPage + 1} إلى{" "}
          {Math.min(currentPage * studentsPerPage, filteredSorted.length)} من{" "}
          {filteredSorted.length} طالب
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            السابق
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
            {currentPage}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;
