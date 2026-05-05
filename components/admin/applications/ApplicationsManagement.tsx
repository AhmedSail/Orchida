"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreVertical,
  Phone,
  ArrowUpDown,
  Loader2,
  Filter,
  Calendar,
  Settings2,
  MessageSquare,
  User,
  BookOpen,
  CheckCircle2,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusManagementDialog from "./StatusManagementDialog";
import AcceptApplicationDialog from "./AcceptApplicationDialog";
import BulkAcceptDialog from "./BulkAcceptDialog";
import EditApplicationDialog from "./EditApplicationDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const MySwal = withReactContent(Swal);

type Application = {
  id: string;
  userId: string;
  courseId: string;
  statusValue: string;
  attendanceType: string;
  studentNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    major: string | null;
    location: string | null;
    age: number | null;
  };
  course: {
    title: string;
    imageUrl: string | null;
  };
  status: {
    label: string;
    color: string;
  } | null;
};

type Status = {
  value: string;
  label: string;
  color: string;
};

type CourseOption = {
  id: string;
  title: string;
};

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkAcceptDialog, setBulkAcceptDialog] = useState<{
    open: boolean;
    courseId: string;
    courseTitle: string;
  }>({
    open: false,
    courseId: "",
    courseTitle: "",
  });
  const [acceptDialog, setAcceptDialog] = useState<{
    open: boolean;
    appId: string;
    courseId: string;
    courseTitle: string;
    studentName: string;
    attendanceType?: string;
  }>({
    open: false,
    appId: "",
    courseId: "",
    courseTitle: "",
    studentName: "",
    attendanceType: "",
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    application: Application | null;
  }>({
    open: false,
    application: null,
  });

  const searchParams = useSearchParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, filtersRes] = await Promise.all([
        fetch("/api/course-applications"),
        fetch("/api/admin/applications-filters")
      ]);
      
      if (!appsRes.ok || !filtersRes.ok) throw new Error("Failed to fetch");
      
      const appsData = await appsRes.json();
      const filtersData = await filtersRes.json();
      
      setApplications(appsData);
      setStatuses(filtersData.statuses);
      setCourses(filtersData.courses);

      // تطبيق الفلتر من الرابط إذا وجد
      const courseId = searchParams.get("courseId");
      if (courseId) {
        setCourseFilter(courseId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/course-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusValue: newStatus }),
      });

      if (res.ok) {
        fetchData();
        MySwal.fire({
          title: "تم التحديث",
          text: "تم تغيير حالة الطلب بنجاح",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      MySwal.fire("خطأ", "فشل تحديث الحالة", "error");
    }
  };

  const allFilteredApps = applications
    .filter((app) => {
      const matchesSearch =
        app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user.phone.includes(searchTerm) ||
        app.course.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || app.statusValue === statusFilter;
      const matchesCourse = courseFilter === "all" || app.courseId === courseFilter;
      
      return matchesSearch && matchesStatus && matchesCourse;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredApps.length / itemsPerPage);
  const currentItems = allFilteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(app => app.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkSMS = async () => {
    if (!bulkMessage) {
      MySwal.fire("تنبيه", "يرجى كتابة نص الرسالة أولاً", "warning");
      return;
    }
    
    try {
      setIsSendingBulk(true);
      const selectedMobiles = applications
        .filter(app => selectedIds.includes(app.id))
        .map(app => app.user.phone);

      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobiles: selectedMobiles,
          text: bulkMessage
        })
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
    const headers = ["الاسم", "الهاتف", "الإيميل", "الدورة", "الحالة", "تاريخ التقديم", "العمر", "التخصص", "الموقع"];
    
    // CSV rows
    const rows = allFilteredApps.map(app => [
      app.user.name,
      app.user.phone,
      app.user.email,
      app.course.title,
      app.status?.label || app.statusValue,
      format(new Date(app.createdAt), "yyyy-MM-dd"),
      app.user.age || "",
      app.user.major || "",
      app.user.location || ""
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Add UTF-8 BOM for Arabic characters
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `طلبات_الالتحاق_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      yellow: "bg-yellow-100 text-yellow-700",
      purple: "bg-purple-100 text-purple-700",
      gray: "bg-gray-100 text-gray-700",
      orange: "bg-orange-100 text-orange-700",
      pink: "bg-pink-100 text-pink-700",
    };
    return colors[color] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-medium">جارٍ تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
            <BookOpen className="text-primary w-8 h-8" />
            طلبات الالتحاق
          </h2>
          <p className="text-zinc-500 font-medium">إدارة الطلبات المبدئية وفلترتها</p>
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
          <Button 
            variant="outline" 
            className="rounded-2xl gap-2 border-zinc-200 font-bold"
            onClick={() => setIsStatusDialogOpen(true)}
          >
            <Settings2 className="w-4 h-4" />
            إدارة الحالات
          </Button>
          <div className="bg-primary/5 border border-primary/10 p-3 rounded-2xl text-center min-w-[120px]">
            <p className="text-xs text-primary font-bold">إجمالي الطلبات</p>
            <p className="text-xl font-black text-primary">{allFilteredApps.length}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="بحث (اسم، هاتف، دورة)..."
            className="pr-10 h-12 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary/20 font-bold"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select 
            className="w-full h-12 pr-10 pl-4 rounded-2xl bg-zinc-50 border-none text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">كل الحالات</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select 
            className="w-full h-12 pr-10 pl-4 rounded-2xl bg-zinc-50 border-none text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الدورات</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <Button 
          variant="outline" 
          className="h-12 rounded-2xl gap-2 border-zinc-100 bg-zinc-50 hover:bg-zinc-100 font-bold"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <Calendar className="w-4 h-4 text-zinc-500" />
          {sortOrder === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}
          <ArrowUpDown className="w-3 h-3 ml-auto" />
        </Button>
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
              <h3 className="font-black text-lg text-primary">عمليات جماعية على المحددين</h3>
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
            <div className="md:col-span-8 relative">
              <Textarea 
                placeholder="اكتب نص الرسالة هنا لإرسالها لجميع المحددين..."
                className="rounded-2xl border-primary/20 focus:ring-primary/20 min-h-[100px] bg-white pr-10 font-bold"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
              />
              <MessageSquare className="absolute right-3 top-3 w-5 h-5 text-primary/40" />
            </div>
            <div className="md:col-span-4 flex flex-col gap-3">
              <Button 
                onClick={handleBulkSMS}
                disabled={isSendingBulk}
                className="h-12 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {isSendingBulk ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال SMS للمحددين"}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const firstApp = applications.find(a => a.id === selectedIds[0]);
                  if (firstApp) {
                    setBulkAcceptDialog({
                      open: true,
                      courseId: firstApp.courseId,
                      courseTitle: firstApp.course.title
                    });
                  }
                }}
                className="h-12 rounded-2xl font-black border-green-600 text-green-600 hover:bg-green-50"
              >
                تحويل المحددين لشعبة
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-100">
              <TableHead className="w-[50px] px-6">
                <Checkbox 
                  checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md border-zinc-300"
                />
              </TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">المتقدم</TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">الدورة</TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">نوع الحضور</TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">الحالة</TableHead>
              <TableHead className="text-right py-5 font-black text-zinc-900">تاريخ التقديم</TableHead>
              <TableHead className="text-left py-5 px-6 w-[80px] font-black text-zinc-900">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((app) => (
                <TableRow key={app.id} className={`border-zinc-50 hover:bg-zinc-50/30 transition-all group ${selectedIds.includes(app.id) ? 'bg-primary/5' : ''}`}>
                  <TableCell className="px-6">
                    <Checkbox 
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={() => toggleSelectOne(app.id)}
                      className="rounded-md border-zinc-300"
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold border border-zinc-200">
                        {app.user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900 group-hover:text-primary transition-colors">{app.user.name}</span>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                            <Phone className="w-3 h-3 text-primary" />
                            {app.user.phone}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                            <Mail className="w-3 h-3 text-primary" />
                            {app.user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    <Badge variant="outline" className="rounded-lg font-bold border-zinc-200 text-zinc-600 bg-zinc-50/50 px-3 py-1">
                      {app.course.title}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${app.attendanceType === 'online' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : app.attendanceType === 'hybrid' ? 'bg-purple-500' : 'bg-orange-500'}`} />
                      <span className={`font-bold text-xs ${app.attendanceType === 'online' ? 'text-blue-600' : app.attendanceType === 'hybrid' ? 'text-purple-600' : 'text-orange-600'}`}>
                        {app.attendanceType === "online" ? "أونلاين" : app.attendanceType === "hybrid" ? "مدمج" : "وجاهي (بالمركز)"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`px-4 py-1.5 rounded-full text-xs font-black transition-all hover:ring-4 hover:ring-offset-2 ${getStatusColor(app.status?.color || "gray")}`}>
                          {app.status?.label || app.statusValue}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-zinc-100">
                        <div className="px-3 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">تغيير الحالة</div>
                        {statuses.map(s => (
                          <DropdownMenuItem 
                            key={s.value}
                            className="rounded-xl gap-2 cursor-pointer font-bold py-2.5"
                            onClick={() => updateStatus(app.id, s.value)}
                          >
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(s.color).split(' ')[0]}`} />
                            {s.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  <TableCell className="py-4 text-zinc-500 font-bold">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-40" />
                      {format(new Date(app.createdAt), "dd MMMM yyyy", { locale: ar })}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 px-6 text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100">
                          <MoreVertical className="w-5 h-5 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-3 shadow-2xl border-zinc-100">
                        <DropdownMenuItem 
                          className="rounded-xl gap-3 cursor-pointer py-3 text-green-600 focus:text-green-600 focus:bg-green-50"
                          onClick={() => {
                            setAcceptDialog({
                              open: true,
                              appId: app.id,
                              courseId: app.courseId,
                              courseTitle: app.course.title,
                              studentName: app.user.name,
                              attendanceType: app.attendanceType,
                            });
                          }}
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">قبول الطلب</span>
                            <span className="text-[10px] text-zinc-500">تحويل الطالب إلى شعبة</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="rounded-xl gap-3 cursor-pointer py-3"
                          onClick={() => window.open(`https://wa.me/${app.user.whatsapp || app.user.phone}`, '_blank')}
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">تواصل واتساب</span>
                            <span className="text-[10px] text-zinc-500">مراسلة الطالب فوراً</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="rounded-xl gap-3 cursor-pointer py-3"
                          onClick={() => {
                            MySwal.fire({
                              title: "تفاصيل المتقدم",
                              html: `
                                <div class="text-right space-y-4" dir="rtl">
                                  <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-zinc-50 p-3 rounded-2xl">
                                      <p class="text-xs text-zinc-500">التخصص</p>
                                      <p class="font-bold">${app.user.major || "غير محدد"}</p>
                                    </div>
                                    <div class="bg-zinc-50 p-3 rounded-2xl">
                                      <p class="text-xs text-zinc-500">العمر</p>
                                      <p class="font-bold">${app.user.age || "غير محدد"}</p>
                                    </div>
                                  </div>
                                  <div class="bg-zinc-50 p-3 rounded-2xl">
                                    <p class="text-xs text-zinc-500">الموقع</p>
                                    <p class="font-bold">${app.user.location || "غير محدد"}</p>
                                  </div>
                                  <div class="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                    <p class="text-xs text-primary font-bold mb-1">ملاحظات الطالب:</p>
                                    <p class="text-sm italic">${app.studentNotes || "لا توجد ملاحظات"}</p>
                                  </div>
                                </div>
                              `,
                              confirmButtonText: "فهمت",
                              confirmButtonColor: "#6D28D9",
                              customClass: { popup: "rounded-3xl" }
                            });
                          }}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">عرض الملف</span>
                            <span className="text-[10px] text-zinc-500">مشاهدة كافة البيانات</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="rounded-xl gap-3 cursor-pointer py-3 text-primary focus:text-primary focus:bg-primary/5"
                          onClick={() => {
                            setEditDialog({
                              open: true,
                              application: app,
                            });
                          }}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Settings2 className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">تعديل البيانات</span>
                            <span className="text-[10px] text-zinc-500">تعديل كافة بيانات الطالب</span>
                          </div>
                        </DropdownMenuItem>
                        
                        <div className="h-px bg-zinc-100 my-2" />
                        
                        <DropdownMenuItem 
                          className="rounded-xl gap-3 cursor-pointer py-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            MySwal.fire({
                              title: "هل أنت متأكد؟",
                              text: "سيتم حذف هذا الطلب نهائياً!",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "نعم، احذف",
                              cancelButtonText: "إلغاء",
                              confirmButtonColor: "#ef4444"
                            }).then((result) => {
                              if (result.isConfirmed) {
                                fetch(`/api/course-applications/${app.id}`, { method: "DELETE" })
                                  .then(() => fetchData());
                              }
                            });
                          }}
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <ArrowUpDown className="w-4 h-4 text-red-600 rotate-45" />
                          </div>
                          <span className="font-bold">حذف الطلب</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <Search className="w-12 h-12" />
                    <p className="font-black text-xl">لا توجد نتائج تطابق بحثك</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 border-t border-zinc-100">
            <p className="text-sm text-zinc-500 font-bold">
              عرض {currentItems.length} من أصل {allFilteredApps.length} طلب
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 border-zinc-200"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`h-10 w-10 rounded-xl font-bold ${currentPage === page ? 'bg-primary shadow-lg shadow-primary/20' : 'border-zinc-200'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 border-zinc-200"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <StatusManagementDialog 
        open={isStatusDialogOpen} 
        onOpenChange={setIsStatusDialogOpen} 
        onRefresh={fetchData} 
      />

      <AcceptApplicationDialog
        open={acceptDialog.open}
        onOpenChange={(open) => setAcceptDialog(prev => ({ ...prev, open }))}
        applicationId={acceptDialog.appId}
        courseId={acceptDialog.courseId}
        courseTitle={acceptDialog.courseTitle}
        studentName={acceptDialog.studentName}
        attendanceType={acceptDialog.attendanceType}
        onSuccess={fetchData}
      />

      <BulkAcceptDialog
        open={bulkAcceptDialog.open}
        onOpenChange={(open) => setBulkAcceptDialog(prev => ({ ...prev, open }))}
        applicationIds={selectedIds}
        courseId={bulkAcceptDialog.courseId}
        courseTitle={bulkAcceptDialog.courseTitle}
        onSuccess={() => {
          setSelectedIds([]);
          fetchData();
        }}
      />

      <EditApplicationDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}
        application={editDialog.application}
        courses={courses}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ApplicationsManagement;
